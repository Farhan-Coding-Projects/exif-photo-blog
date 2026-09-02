import { absolutePathForAlbum, absolutePathForAlbumImage } from '@/app/path';
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

export interface Album {
  id: string
  title: string
  slug: string
  subhead?: string
  description?: string
  location?: Place
}

type AlbumWithMeta = {
  album: Album
} & CategoryQueryMeta;

export type Albums = AlbumWithMeta[];

export const ALBUM_FAVORITES_TITLE = 'Favorites';
export const ALBUM_FAVORITES_SLUG = 'favorites';

export const isAlbumFavorites = (album: Album) =>
  album.slug === ALBUM_FAVORITES_SLUG;

export const sortAlbums = (albums: Albums) => albums.sort((a, b) =>
  Number(isAlbumFavorites(b.album)) -
  Number(isAlbumFavorites(a.album)) ||
  b.count - a.count ||
  a.album.title.localeCompare(b.album.title));

export type AlbumOrAlbumSlug = Album | string;

export const parseAlbumFromDb = (album: any): Album =>
  camelcaseKeys(album);

export const albumHasMeta = (album: Album) =>
  album.subhead ||
  album.description ||
  album.location;

export const titleForAlbum = (
  album: Album,
  photos:Photo[] = [],
  appText: AppTextState,
  explicitCount?: number,
) => [
  album.title,
  photoQuantityText(explicitCount ?? photos.length, appText),
].join(' ');

export const shareTextForAlbum = (
  album: Album,
  appText: AppTextState,
) => [
  `${appText.category.album}:`,
  album.title,
].join(' ');

export const descriptionForAlbumPhotos = (
  photos: Photo[] = [],
  appText: AppTextState,
  dateBased?: boolean,
  explicitCount?: number,
  explicitDateRange?: PhotoDateRangePostgres,
) =>
  descriptionForPhotoSet(
    photos,
    appText,
    undefined,
    dateBased,
    explicitCount,
    explicitDateRange,
  );

export const generateMetaForAlbum = (
  album: Album,
  photos: Photo[],
  appText: AppTextState,
  explicitCount?: number,
  explicitDateRange?: PhotoDateRangePostgres,
) => ({
  url: absolutePathForAlbum(album),
  title: titleForAlbum(album, photos, appText, explicitCount),
  description: descriptionForAlbumPhotos(
    photos,
    appText,
    true,
    explicitCount,
    explicitDateRange,
  ),
  images: absolutePathForAlbumImage(album),
});

export const deleteAlbumConfirmationText = (
  album: Album,
  count: number,
  appText: AppTextState,
) =>
  `Are you sure you want to delete the "${album.title}" album, containing ` +
  `${photoQuantityText(count, appText, false, false).toLowerCase()}? ` +
  'No photos will be deleted.';
