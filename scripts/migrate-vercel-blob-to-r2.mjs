import { get, list } from '@vercel/blob';
import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Pool } from 'pg';

const isExecute = process.argv.includes('--execute');
const concurrency = 4;

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

const blobToken = required('BLOB_READ_WRITE_TOKEN');
const bucket = required('NEXT_PUBLIC_CLOUDFLARE_R2_BUCKET');
const accountId = required('NEXT_PUBLIC_CLOUDFLARE_R2_ACCOUNT_ID');
const publicDomain = required('NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_DOMAIN')
  .replace(/^https?:\/\//, '').replace(/\/$/, '');
const accessKeyId = required('CLOUDFLARE_R2_ACCESS_KEY');
const secretAccessKey = required('CLOUDFLARE_R2_SECRET_ACCESS_KEY');
const postgresUrl = required('POSTGRES_URL');

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});
const pool = new Pool({ connectionString: postgresUrl, ssl: true });

const keyForBlob = (url) => {
  const pathname = new URL(url).pathname.replace(/^\/+/, '');
  return decodeURIComponent(pathname);
};

const destinationUrlForKey = (key) => `https://${publicDomain}/${key}`;

const downloadVercelBlob = async (blob) => {
  let lastError;
  for (const access of ['public', 'private']) {
    try {
      const result = await get(blob.pathname, {
        access,
        token: blobToken,
      });
      if (!result) throw new Error(`Blob not found: ${blob.pathname}`);
      if (result.statusCode !== 200 || !result.stream) {
        throw new Error(`Unexpected response for ${blob.pathname}`);
      }
      return {
        body: Buffer.from(await new Response(result.stream).arrayBuffer()),
        contentType: result.blob.contentType,
      };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
};

const listAllBlobs = async () => {
  const blobs = [];
  let cursor;
  do {
    const page = await list({ token: blobToken, cursor });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return blobs;
};

const existsInR2 = async (key) => {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (error) {
    if (error?.$metadata?.httpStatusCode === 404 || error?.name === 'NotFound') {
      return false;
    }
    throw error;
  }
};

const migrateBlob = async (blob) => {
  const key = keyForBlob(blob.url);
  const destinationUrl = destinationUrlForKey(key);
  const alreadyThere = await existsInR2(key);

  if (!isExecute) {
    return { key, destinationUrl, action: alreadyThere ? 'skip' : 'copy' };
  }

  if (!alreadyThere) {
    const { body, contentType } = await downloadVercelBlob(blob);
    await r2.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType || undefined,
      CacheControl: 'public, max-age=31536000, immutable',
    }));
  }

  return { key, destinationUrl, action: alreadyThere ? 'skip' : 'copy' };
};

const updatePhotoUrl = async (sourceUrl, destinationUrl) => {
  if (!isExecute) return 0;
  const result = await pool.query(
    'UPDATE photos SET url = $1, updated_at = CURRENT_TIMESTAMP WHERE url = $2',
    [destinationUrl, sourceUrl],
  );
  return result.rowCount ?? 0;
};

const run = async () => {
  console.log(`${isExecute ? 'Executing' : 'Dry run'} Vercel Blob → R2 migration`);
  const blobs = await listAllBlobs();
  console.log(`Found ${blobs.length} Vercel Blob object(s)`);

  let copied = 0;
  let skipped = 0;
  let updated = 0;
  let completed = 0;
  const failures = [];

  for (let index = 0; index < blobs.length; index += concurrency) {
    const batch = blobs.slice(index, index + concurrency);
    const results = await Promise.allSettled(batch.map(async (blob) => {
      const result = await migrateBlob(blob);
      const rows = await updatePhotoUrl(blob.url, result.destinationUrl);
      return { ...result, rows };
    }));

    for (let offset = 0; offset < results.length; offset++) {
      const result = results[offset];
      completed++;
      if (result.status === 'rejected') {
        failures.push({ url: batch[offset].url, error: result.reason });
        console.error(`FAILED ${batch[offset].url}: ${result.reason?.message || result.reason}`);
        continue;
      }
      if (result.value.action === 'copy') copied++;
      else skipped++;
      updated += result.value.rows;
      console.log(`[${completed}/${blobs.length}] ${result.value.action} ${result.value.key}`);
    }
  }

  console.log(`Finished: ${copied} copied, ${skipped} already in R2, ${updated} photo URL(s) updated`);
  if (failures.length) {
    console.error(`${failures.length} object(s) failed; rerun after fixing the reported issue.`);
    process.exitCode = 1;
  }
};

run().finally(() => pool.end());
