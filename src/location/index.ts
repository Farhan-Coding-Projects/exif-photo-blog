import { CategoryQueryMeta } from '@/category';
import { AppTextState } from '@/i18n/state';
import {
  descriptionForPhotoSet,
  Photo,
  PhotoDateRangePostgres,
  photoQuantityText,
} from '@/photo';
import { Place } from '@/place';
import camelcaseKeys from 'camelcase-keys';

export interface Location {
  id: string
  title: string
  slug: string
  subhead?: string
  description?: string
  place?: Place
}

export type LocationWithMeta = {
  location: Location
} & CategoryQueryMeta;

export type Locations = LocationWithMeta[];
export type LocationOrLocationSlug = Location | string;

export const parseLocationFromDb = (location: any): Location =>
  camelcaseKeys(location);

export const locationHasMeta = (location: Location) =>
  location.subhead || location.description || location.place;

export const titleForLocation = (
  location: Location,
  photos: Photo[] = [],
  appText: AppTextState,
  explicitCount?: number,
) => [
  location.title,
  photoQuantityText(explicitCount ?? photos.length, appText),
].join(' ');

export const descriptionForLocationPhotos = (
  photos: Photo[] = [],
  appText: AppTextState,
  explicitCount?: number,
  explicitDateRange?: PhotoDateRangePostgres,
) => descriptionForPhotoSet(
  photos,
  appText,
  undefined,
  true,
  explicitCount,
  explicitDateRange,
);

export const deleteLocationConfirmationText = (
  location: Location,
  count: number,
  appText: AppTextState,
) =>
  `Are you sure you want to delete the "${location.title}" location, ` +
  `containing ${photoQuantityText(
    count,
    appText,
    false,
    false,
  ).toLowerCase()}? ` +
  'No photos will be deleted.';
