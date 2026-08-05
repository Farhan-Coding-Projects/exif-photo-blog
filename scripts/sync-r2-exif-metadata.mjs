import { Pool } from 'pg';
import exifr from 'exifr';
import sharp from 'sharp';

const required = name => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

const postgresUrl = required('POSTGRES_URL');
const r2Domain = required('NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_DOMAIN')
  .replace(/\/$/, '');
const execute = process.argv.includes('--execute');
const pool = new Pool({ connectionString: postgresUrl });

const columns = {
  width: 'width',
  height: 'height',
  aspectRatio: 'aspect_ratio',
  make: 'make',
  model: 'model',
  focalLength: 'focal_length',
  focalLengthIn35MmFormat: 'focal_length_in_35mm_format',
  lensMake: 'lens_make',
  lensModel: 'lens_model',
  fNumber: 'f_number',
  iso: 'iso',
  exposureTime: 'exposure_time',
  exposureCompensation: 'exposure_compensation',
  takenAt: 'taken_at',
  takenAtNaive: 'taken_at_naive',
};

const first = (...values) => values.find(value =>
  value !== undefined && value !== null && value !== '');

const asNumber = value => {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
};

const asDate = value => {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const formatNaive = date => date.toISOString()
  .replace('T', ' ')
  .replace(/\.\d{3}Z$/, '');

const readMetadata = async response => {
  const bytes = Buffer.from(await response.arrayBuffer());
  const [exif, image] = await Promise.all([
    exifr.parse(bytes, { xmp: true }).catch(() => undefined),
    sharp(bytes).metadata(),
  ]);
  const date = asDate(first(
    exif?.DateTimeOriginal,
    exif?.CreateDate,
    exif?.ModifyDate,
  ));
  const width = asNumber(first(exif?.ImageWidth, image.width));
  const height = asNumber(first(exif?.ImageHeight, image.height));

  return {
    ...width && { width },
    ...height && { height },
    ...width && height && { aspectRatio: width / height },
    ...first(exif?.Make, exif?.make) && {
      make: first(exif?.Make, exif?.make),
    },
    ...first(exif?.Model, exif?.model) && {
      model: first(exif?.Model, exif?.model),
    },
    ...asNumber(first(exif?.FocalLength, exif?.focalLength)) && {
      focalLength: asNumber(first(exif?.FocalLength, exif?.focalLength)),
    },
    ...asNumber(first(exif?.FocalLengthIn35mmFormat, exif?.FocalLengthIn35mm)) && {
      focalLengthIn35MmFormat: asNumber(first(
        exif?.FocalLengthIn35mmFormat,
        exif?.FocalLengthIn35mm,
      )),
    },
    ...first(exif?.LensMake, exif?.lensMake) && {
      lensMake: first(exif?.LensMake, exif?.lensMake),
    },
    ...first(exif?.LensModel, exif?.lensModel) && {
      lensModel: first(exif?.LensModel, exif?.lensModel),
    },
    ...asNumber(first(exif?.FNumber, exif?.ApertureValue)) && {
      fNumber: asNumber(first(exif?.FNumber, exif?.ApertureValue)),
    },
    ...asNumber(first(exif?.ISO, exif?.ISOSpeed)) && {
      iso: asNumber(first(exif?.ISO, exif?.ISOSpeed)),
    },
    ...asNumber(first(exif?.ExposureTime, exif?.ShutterSpeedValue)) && {
      exposureTime: asNumber(first(exif?.ExposureTime, exif?.ShutterSpeedValue)),
    },
    ...asNumber(exif?.ExposureCompensation) !== undefined && {
      exposureCompensation: asNumber(exif?.ExposureCompensation),
    },
    ...date && { takenAt: date.toISOString(), takenAtNaive: formatNaive(date) },
  };
};

const update = async (id, metadata) => {
  const entries = Object.entries(metadata)
    .filter(([field, value]) => columns[field] && value !== undefined);
  if (entries.length === 0) return 0;
  const values = entries.map(([, value]) => value);
  const assignments = entries.map(([field], index) =>
    `"${columns[field]}"=$${index + 1}`,
  );
  values.push(id);
  await pool.query(
    `UPDATE photos SET ${assignments.join(', ')}, updated_at=CURRENT_TIMESTAMP WHERE id=$${values.length}`,
    values,
  );
  return entries.length;
};

try {
  const { rows } = await pool.query(
    `SELECT id, url FROM photos WHERE url LIKE $1 ORDER BY created_at ASC`,
    [`${r2Domain}/%`],
  );
  console.log(`${execute ? 'Executing' : 'Dry run'} R2 EXIF metadata sync`);
  console.log(`Found ${rows.length} photo record(s) using ${r2Domain}`);

  let updated = 0;
  let failed = 0;
  for (const [index, photo] of rows.entries()) {
    try {
      const response = await fetch(photo.url, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const metadata = await readMetadata(response);
      const fields = Object.keys(metadata).join(', ') || 'none';
      if (execute) await update(photo.id, metadata);
      console.log(`[${index + 1}/${rows.length}] ${photo.id}: ${fields}`);
      updated++;
    } catch (error) {
      failed++;
      console.error(`FAILED ${photo.id} ${photo.url}: ${error.message}`);
    }
  }
  console.log(`Finished: ${execute ? updated : 0} updated, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
} finally {
  await pool.end();
}
