import {
  getLocationFromSlug,
  getLocationsForPhoto,
  getLocationsWithMeta,
  getLocationTitlesForPhoto,
  getTagsForLocation,
} from './query';
import { KEY_LOCATIONS, KEY_PHOTOS } from '@/cache';
import { unstable_cache } from 'next/cache';

export const getLocationFromSlugCached = unstable_cache(
  getLocationFromSlug,
  [KEY_PHOTOS, KEY_LOCATIONS],
);
export const getLocationsWithMetaCached = unstable_cache(
  getLocationsWithMeta,
  [KEY_PHOTOS, KEY_LOCATIONS],
);
export const getLocationsForPhotoCached = unstable_cache(
  getLocationsForPhoto,
  [KEY_PHOTOS, KEY_LOCATIONS],
);
export const getLocationTitlesForPhotoCached = unstable_cache(
  getLocationTitlesForPhoto,
  [KEY_PHOTOS, KEY_LOCATIONS],
);
export const getTagsForLocationCached = unstable_cache(
  getTagsForLocation,
  [KEY_PHOTOS, KEY_LOCATIONS],
);
