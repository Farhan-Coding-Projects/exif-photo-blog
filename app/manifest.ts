import type { MetadataRoute } from 'next';
import { META_TITLE } from '@/app/config';

// Icons are shared with the main site, like the favicon in app/layout.tsx
const ICON_BASE = 'https://www.farhansadeek.com';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: META_TITLE,
    short_name: 'Photos',
    start_url: '/',
    display: 'browser',
    icons: [
      { src: `${ICON_BASE}/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: `${ICON_BASE}/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: `${ICON_BASE}/icon-maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
