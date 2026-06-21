/**
 * One-off migration: copy every photo from this repo's Vercel Blob + Postgres
 * (photo-graphy) into the sibling repo's Vercel Blob + Postgres (exif-photo-blog).
 *
 * Run from the photo-graphy repo root:
 *   pnpm dlx tsx scripts/migrate-photos-to-exif-blog.ts
 *
 * Reads source creds from   ./.env.local                       (POSTGRES_URL)
 * Reads dest   creds from   ../exif-photo-blog/.env.local      (POSTGRES_URL, BLOB_READ_WRITE_TOKEN)
 * Source blob URLs are public, so no source BLOB_READ_WRITE_TOKEN is needed for downloads.
 *
 * Idempotent: skips photos whose id already exists in the destination.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Client } from 'pg';
import { put } from '@vercel/blob';

const SRC_ENV_FILE  = resolve(process.cwd(), '.env.local');
const DEST_ENV_FILE = resolve(process.cwd(), '..', 'exif-photo-blog', '.env.local');

function parseEnvFile(path: string): Record<string, string> {
  const env: Record<string, string> = {};
  for (const raw of readFileSync(path, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const srcEnv  = parseEnvFile(SRC_ENV_FILE);
const destEnv = parseEnvFile(DEST_ENV_FILE);

const srcPostgresUrl  = srcEnv.POSTGRES_URL  ?? srcEnv.DATABASE_URL;
const destPostgresUrl = destEnv.POSTGRES_URL ?? destEnv.DATABASE_URL;
const destBlobToken   = destEnv.BLOB_READ_WRITE_TOKEN;

if (!srcPostgresUrl)  throw new Error(`Missing POSTGRES_URL in ${SRC_ENV_FILE}`);
if (!destPostgresUrl) throw new Error(`Missing POSTGRES_URL in ${DEST_ENV_FILE}`);
if (!destBlobToken)   throw new Error(`Missing BLOB_READ_WRITE_TOKEN in ${DEST_ENV_FILE}`);

const stripSslmode = (url: string) =>
  url.replace(/([?&])sslmode=[^&]*&?/g, '$1').replace(/[?&]$/, '');

const PHOTOS_TABLE_DDL = `
  CREATE TABLE IF NOT EXISTS photos (
    id VARCHAR(8) PRIMARY KEY,
    url VARCHAR(255) NOT NULL,
    extension VARCHAR(255) NOT NULL,
    aspect_ratio REAL DEFAULT 1.5,
    blur_data TEXT,
    title VARCHAR(255),
    caption TEXT,
    semantic_description TEXT,
    tags VARCHAR(255)[],
    make VARCHAR(255),
    model VARCHAR(255),
    focal_length SMALLINT,
    focal_length_in_35mm_format SMALLINT,
    lens_make VARCHAR(255),
    lens_model VARCHAR(255),
    f_number REAL,
    iso SMALLINT,
    exposure_time DOUBLE PRECISION,
    exposure_compensation REAL,
    location_name VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    film VARCHAR(255),
    recipe_title VARCHAR(255),
    recipe_data JSONB,
    color_data JSONB,
    color_sort SMALLINT,
    priority_order REAL,
    taken_at TIMESTAMP WITH TIME ZONE NOT NULL,
    taken_at_naive VARCHAR(255) NOT NULL,
    exclude_from_feeds BOOLEAN DEFAULT FALSE,
    hidden BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )
`;

function describe(url: string) {
  try {
    const u = new URL(url);
    return `${u.username}@${u.hostname}${u.pathname}`;
  } catch {
    return '(unparseable url)';
  }
}

async function connect(label: string, url: string) {
  const client = new Client({
    connectionString: stripSslmode(url),
    ssl: { rejectUnauthorized: false },
  });
  console.log(`Connecting to ${label}: ${describe(url)}`);
  try {
    await client.connect();
    console.log(`  ${label} connected.`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`${label} connect failed: ${msg} (${describe(url)})`);
  }
  return client;
}

async function main() {
  const src  = await connect('SOURCE (photo-graphy)',     srcPostgresUrl!);
  const dest = await connect('DEST   (exif-photo-blog)',  destPostgresUrl!);

  await dest.query(PHOTOS_TABLE_DDL);

  const { rows: photos } = await src.query(
    'SELECT * FROM photos ORDER BY created_at ASC',
  );
  console.log(`Found ${photos.length} photo(s) in source.\n`);

  let copied = 0, skipped = 0, failed = 0;

  for (const p of photos) {
    const tag = `[${p.id}]`;
    try {
      const existing = await dest.query(
        'SELECT 1 FROM photos WHERE id = $1',
        [p.id],
      );
      if (existing.rowCount) {
        console.log(`${tag} SKIP (already in destination)`);
        skipped++;
        continue;
      }

      const res = await fetch(p.url);
      if (!res.ok) throw new Error(`download ${res.status} ${res.statusText} <- ${p.url}`);
      const buf = Buffer.from(await res.arrayBuffer());

      const sourcePath = new URL(p.url).pathname.replace(/^\//, '');
      const fileName = sourcePath || `${p.id}.${p.extension}`;

      const { url: newUrl } = await put(fileName, buf, {
        access: 'public',
        token: destBlobToken,
        contentType: res.headers.get('content-type') ?? undefined,
        addRandomSuffix: false,
        allowOverwrite: true,
      });

      await dest.query(
        `
        INSERT INTO photos (
          id, url, extension, aspect_ratio, blur_data, title, caption,
          semantic_description, tags, make, model, focal_length,
          focal_length_in_35mm_format, lens_make, lens_model, f_number, iso,
          exposure_time, exposure_compensation, location_name, latitude, longitude,
          film, recipe_title, recipe_data, color_data, color_sort, priority_order,
          exclude_from_feeds, hidden, taken_at, taken_at_naive, updated_at, created_at
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,
          $19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34
        )
        `,
        [
          p.id,
          newUrl,
          p.extension,
          p.aspect_ratio,
          p.blur_data,
          p.title,
          p.caption,
          p.semantic_description,
          p.tags,
          p.make,
          p.model,
          p.focal_length,
          p.focal_length_in_35mm_format,
          p.lens_make,
          p.lens_model,
          p.f_number,
          p.iso,
          p.exposure_time,
          p.exposure_compensation,
          p.location_name,
          p.latitude,
          p.longitude,
          p.film,
          p.recipe_title,
          p.recipe_data ? JSON.stringify(p.recipe_data) : null,
          p.color_data  ? JSON.stringify(p.color_data)  : null,
          p.color_sort,
          p.priority_order,
          p.exclude_from_feeds,
          p.hidden,
          p.taken_at,
          p.taken_at_naive,
          p.updated_at,
          p.created_at,
        ],
      );

      console.log(`${tag} OK   -> ${newUrl}`);
      copied++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`${tag} FAIL ${msg}`);
      failed++;
    }
  }

  await src.end();
  await dest.end();

  console.log(`\nDone. copied=${copied} skipped=${skipped} failed=${failed}`);
  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
