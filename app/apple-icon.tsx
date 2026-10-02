import { getIBMPlexMono } from '@/app/font';
import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// iOS fills transparent pixels with black and rounds corners itself,
// so render a full-bleed square
export default async function AppleIcon() {
  const { fontFamily, fonts } = await getIBMPlexMono();

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'black',
        color: 'white',
        fontFamily,
        fontSize: 120,
        lineHeight: 1,
      }}
    >
      F
    </div>,
    { ...size, fonts },
  );
}
