import {
  RELATED_GRID_PHOTOS_TO_SHOW,
  descriptionForPhoto,
  titleForPhoto,
} from '@/photo';
import { Metadata } from 'next/types';
import { redirect } from 'next/navigation';
import {
  PATH_ROOT,
  absolutePathForPhoto,
  absolutePathForPhotoImage,
} from '@/app/path';
import PhotoDetailPage from '@/photo/PhotoDetailPage';
import { getPhotosMetaCached, getPhotosNearIdCached } from '@/photo/cache';
import { cache } from 'react';
import { getLocationFromSlug } from '@/location/query';
import { Location } from '@/location';

const getPhotosNearIdCachedCached = cache((
  photoId: string,
  location: Location,
) => getPhotosNearIdCached(photoId, {
  location,
  limit: RELATED_GRID_PHOTOS_TO_SHOW + 2,
}));

interface Props {
  params: Promise<{ photoId: string, location: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { photoId, location: value } = await params;
  const location = await getLocationFromSlug(decodeURIComponent(value));
  if (!location) { return {}; }
  const { photo } = await getPhotosNearIdCachedCached(photoId, location);
  if (!photo) { return {}; }
  const title = titleForPhoto(photo);
  const description = descriptionForPhoto(photo);
  const images = absolutePathForPhotoImage(photo);
  const url = absolutePathForPhoto({ photo, location });
  return {
    title,
    description,
    openGraph: { title, description, images, url },
    twitter: { title, description, images, card: 'summary_large_image' },
  };
}

export default async function PhotoLocationPage({ params }: Props) {
  const { photoId, location: value } = await params;
  const location = await getLocationFromSlug(decodeURIComponent(value));
  if (!location) { redirect(PATH_ROOT); }
  const { photo, photos, photosGrid, indexNumber } =
    await getPhotosNearIdCachedCached(photoId, location);
  if (!photo) { redirect(PATH_ROOT); }
  const { count, dateRange } = await getPhotosMetaCached({ location });
  return <PhotoDetailPage {...{
    photo,
    photos,
    photosGrid,
    location,
    indexNumber,
    count,
    dateRange,
  }} />;
}
