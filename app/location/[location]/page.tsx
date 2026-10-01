import { INFINITE_SCROLL_GRID_INITIAL } from '@/photo';
import {
  PATH_ROOT,
  absolutePathForLocation,
  absolutePathForPhotoImage,
} from '@/app/path';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAppText } from '@/i18n/state/server';
import LocationOverview from '@/location/LocationOverview';
import {
  descriptionForLocationPhotos,
  titleForLocation,
} from '@/location';
import {
  getLocationFromSlugCached,
  getLocationsWithMetaCached,
} from '@/location/cache';
import { getPhotosCached, getPhotosMetaCached } from '@/photo/cache';
import { staticallyGenerateCategoryIfConfigured } from '@/app/static';

export const generateStaticParams = staticallyGenerateCategoryIfConfigured(
  'locations',
  'page',
  getLocationsWithMetaCached,
  locations => locations.map(({ location }) => ({
    location: location.slug,
  })),
);

interface Props { params: Promise<{ location: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeURIComponent((await params).location);
  const location = await getLocationFromSlugCached(slug);
  if (!location) { return {}; }
  const [photos, { count, dateRange }] = await Promise.all([
    getPhotosCached({ location, limit: INFINITE_SCROLL_GRID_INITIAL }),
    getPhotosMetaCached({ location }),
  ]);
  if (photos.length === 0) { return {}; }
  const appText = await getAppText();
  const title = titleForLocation(location, photos, appText, count);
  const description = descriptionForLocationPhotos(
    photos,
    appText,
    count,
    dateRange,
  );
  const images = absolutePathForPhotoImage(photos[0]);
  const url = absolutePathForLocation(location);
  return {
    title,
    description,
    openGraph: { title, description, images, url },
    twitter: { description, images, card: 'summary_large_image' },
  };
}

export default async function LocationPage({ params }: Props) {
  const slug = decodeURIComponent((await params).location);
  const location = await getLocationFromSlugCached(slug);
  if (!location) { redirect(PATH_ROOT); }
  const [photos, { count, dateRange }] = await Promise.all([
    getPhotosCached({ location, limit: INFINITE_SCROLL_GRID_INITIAL }),
    getPhotosMetaCached({ location }),
  ]);
  return <LocationOverview {...{
    location,
    photos,
    count,
    dateRange,
  }} />;
}
