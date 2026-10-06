import type { MetadataRoute } from 'next';
import { META_TITLE } from '@/app/config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: META_TITLE,
    short_name: 'Farhan\'s Photography',
    start_url: '/',
    display: 'browser',
    icons: [
      {
        src: '/favicons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
