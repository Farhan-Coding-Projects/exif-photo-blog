import { Pool } from 'pg';
import sharp from 'sharp';

const required = name => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

const key = required('OPENAI_SECRET_KEY');
const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1')
  .replace(/\/$/, '');
const model = process.env.OPENAI_MODEL || 'gpt-5.4-nano';
const domain = required('NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_DOMAIN')
  .replace(/\/$/, '');
const pool = new Pool({ connectionString: required('POSTGRES_URL') });

const responseJson = text => {
  const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  return JSON.parse(cleaned);
};

const imageDataUrl = async url => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Image HTTP ${response.status}`);
  const input = Buffer.from(await response.arrayBuffer());
  const output = await sharp(input)
    .resize({ width: 200, withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toBuffer();
  return `data:image/jpeg;base64,${output.toString('base64')}`;
};

const generate = async image => {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${key}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      reasoning_effort: 'none',
      max_completion_tokens: 500,
      response_format: { type: 'json_object' },
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: [
              'Analyze this photograph and return valid JSON only.',
              'Use exactly these keys: title, caption, tags, semanticDescription.',
              'Title: 2-5 natural words, no quotation marks.',
              'Caption: one concise sentence, no invented location or facts.',
              'Tags: an array of 3-6 specific lowercase keywords.',
              'semanticDescription: one concise visual description.',
              'Do not mention that you are an AI.',
            ].join(' '),
          },
          { type: 'image_url', image_url: { url: image } },
        ],
      }],
    }),
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`AI HTTP ${response.status}: ${body.slice(0, 300)}`);
  const result = JSON.parse(body);
  return responseJson(result.choices?.[0]?.message?.content || '');
};

try {
  const { rows } = await pool.query(
    `SELECT id, url FROM photos WHERE url LIKE $1
     AND ((title IS NULL OR title = '') OR
          (caption IS NULL OR caption = '') OR
          (tags IS NULL OR array_length(tags, 1) = 0) OR
          (semantic_description IS NULL OR semantic_description = ''))
     ORDER BY created_at ASC`,
    [`${domain}/%`],
  );
  console.log(`Generating AI metadata for ${rows.length} R2 photo(s) with ${model}`);
  let updated = 0;
  for (const [index, photo] of rows.entries()) {
    try {
      let result;
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          result = await generate(await imageDataUrl(photo.url));
          break;
        } catch (error) {
          if (!error.message.includes('AI HTTP 429') || attempt === 4) {
            throw error;
          }
          console.log(`Rate limited; waiting before retrying ${photo.id} ...`);
          await new Promise(resolve => setTimeout(resolve, 25000));
        }
      }
      const tags = Array.isArray(result.tags) ? result.tags : [];
      await pool.query(
        `UPDATE photos SET
          title = COALESCE(NULLIF(title, ''), $1),
          caption = COALESCE(NULLIF(caption, ''), $2),
          tags = CASE WHEN tags IS NULL OR array_length(tags, 1) = 0 THEN $3 ELSE tags END,
          semantic_description = COALESCE(NULLIF(semantic_description, ''), $4),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5`,
        [result.title || null, result.caption || null, tags, result.semanticDescription || null, photo.id],
      );
      console.log(`[${index + 1}/${rows.length}] ${photo.id}: ${result.title}`);
      updated++;
    } catch (error) {
      console.error(`FAILED ${photo.id}: ${error.message}`);
    }
  }
  console.log(`Finished: ${updated}/${rows.length} updated`);
} finally {
  await pool.end();
}
