import { promises as fs } from 'fs';
import path from 'path';
import { cwd } from 'process';

type FontFile = { family: string, path: string };

const FONT_QUICKSAND: FontFile = {
  family: 'Quicksand',
  path: '/public/fonts/Quicksand-Medium.ttf',
};
const FONT_FALLBACK_FAMILY = 'Geist';
const FONT_FALLBACK_PATH = '/node_modules/next/dist/compiled/@vercel/og/' +
  'Geist-Regular.ttf';

// Cloudflare Workers has no filesystem: read from static assets instead
const getFontDataFromCloudflareAssets = async ({ family, path }: FontFile) => {
  const { getCloudflareContext } = await import('@opennextjs/cloudflare');
  const { env } = await getCloudflareContext({ async: true });
  const { ASSETS } = env as unknown as {
    ASSETS: { fetch: (url: URL) => Promise<Response> }
  };
  const response = await ASSETS.fetch(
    new URL(path.replace('/public', ''), 'https://assets'),
  );
  if (!response.ok) {
    throw new Error(`Font asset fetch failed (${response.status})`);
  }
  return {
    data: Buffer.from(await response.arrayBuffer()),
    fontFamily: family,
  };
};

const getFontData = async (font: FontFile) => {
  if (globalThis.navigator?.userAgent === 'Cloudflare-Workers') {
    return getFontDataFromCloudflareAssets(font);
  }
  try {
    return {
      data: await fs.readFile(path.join(cwd(), font.path)),
      fontFamily: font.family,
    };
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      console.warn(
        `Font not found at ${font.path}; ` +
        `using bundled ${FONT_FALLBACK_FAMILY} for generated images.`,
      );
      return {
        data: await fs.readFile(path.join(cwd(), FONT_FALLBACK_PATH)),
        fontFamily: FONT_FALLBACK_FAMILY,
      };
    }
    throw error;
  }
};

const loadFont = (font: FontFile) => getFontData(font)
  .then(({ data, fontFamily }) => ({
    fontFamily,
    fonts: [{
      name: fontFamily,
      data,
      weight: 500,
      style: 'normal',
    } as const],
  }));

const fontConfigPromises = new Map<FontFile, ReturnType<typeof loadFont>>();

const getFont = (font: FontFile) => {
  if (!fontConfigPromises.has(font)) {
    fontConfigPromises.set(font, loadFont(font));
  }
  return fontConfigPromises.get(font)!;
};

// Matches the site font
export const getQuicksand = () => getFont(FONT_QUICKSAND);
