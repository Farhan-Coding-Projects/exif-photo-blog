import { promises as fs } from 'fs';
import path from 'path';
import { cwd } from 'process';

const FONT_IBM_PLEX_MONO_FAMILY = 'IBMPlexMono';
const FONT_IBM_PLEX_MONO_PATH = '/public/fonts/IBMPlexMono-Medium.ttf';
const FONT_FALLBACK_FAMILY = 'Geist';
const FONT_FALLBACK_PATH = '/node_modules/next/dist/compiled/@vercel/og/' +
  'Geist-Regular.ttf';

const getFontData = async () => {
  try {
    return {
      data: await fs.readFile(path.join(cwd(), FONT_IBM_PLEX_MONO_PATH)),
      fontFamily: FONT_IBM_PLEX_MONO_FAMILY,
    };
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      console.warn(
        `Font not found at ${FONT_IBM_PLEX_MONO_PATH}; ` +
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

const loadIBMPlexMono = () => getFontData()
  .then(({ data, fontFamily }) => ({
    fontFamily,
    fonts: [{
      name: fontFamily,
      data,
      weight: 500,
      style: 'normal',
    } as const],
  }));

let fontConfigPromise: ReturnType<typeof loadIBMPlexMono> | undefined;

export const getIBMPlexMono = () => {
  fontConfigPromise ??= loadIBMPlexMono();
  return fontConfigPromise;
};
