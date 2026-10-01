import {
  BASE_URL,
  IMAGE_QUALITY,
  VERCEL_BYPASS_KEY,
  VERCEL_BYPASS_SECRET,
} from '@/app/config';

// Explicity defined next.config.js `imageSizes`
type NextCustomSize = 100 | 200;

type NextImageDeviceSize = 640 | 750 | 828 | 1080 | 1200 | 1920 | 2048 | 3840;

export type NextImageSize = NextCustomSize | NextImageDeviceSize;

export const MAX_IMAGE_SIZE: NextImageSize = 3840;

export const getNextImageUrlForRequest = ({
  imageUrl,
  size,
  quality = IMAGE_QUALITY,
  baseUrl = BASE_URL,
  addBypassSecret,
}: {
  imageUrl: string
  size: NextImageSize
  quality?: number
  baseUrl?: string
  addBypassSecret?: boolean
}) => {
  // Empty baseUrl returns a same-origin relative path
  const url = new URL('/_next/image', baseUrl || 'http://localhost');

  url.searchParams.append('url', imageUrl);
  url.searchParams.append('w', size.toString());
  url.searchParams.append('q', quality.toString());

  if (addBypassSecret && VERCEL_BYPASS_SECRET) {
    url.searchParams.append(VERCEL_BYPASS_KEY, VERCEL_BYPASS_SECRET);
  }

  return baseUrl
    ? url.toString()
    : `${url.pathname}${url.search}`;
};
