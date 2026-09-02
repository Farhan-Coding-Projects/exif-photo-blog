import {
  SHOW_FILMS,
  SHOW_FOCAL_LENGTHS,
  SHOW_LENSES,
  SHOW_RECIPES,
  SHOW_CAMERAS,
  SHOW_TAGS,
  SHOW_YEARS,
  SHOW_RECENTS,
  SHOW_ALBUMS,
  SHOW_LOCATIONS,
} from '@/app/config';
import { createLensKey } from '@/lens';
import { sortTagsByCount, TAG_FAVS } from '@/tag';
import { PhotoSetCategories, sortCategoriesByCount } from '@/category';
import { sortFocalLengths } from '@/focal';
import {
  getPhotosMetaCached,
  getUniqueCamerasCached,
  getUniqueFilmsCached,
  getUniqueFocalLengthsCached,
  getUniqueLensesCached,
  getUniqueRecipesCached,
  getUniqueTagsCached,
  getUniqueYearsCached,
} from '@/photo/cache';
import { getAlbumsWithMetaCached } from '@/album/cache';
import { getLocationsWithMetaCached } from '@/location/cache';
import { sortAlbums } from '@/album';

type CategoryData = Awaited<ReturnType<typeof getDataForCategories>>;

export const NULL_CATEGORY_DATA: CategoryData = {
  recents: [],
  years: [],
  cameras: [],
  lenses: [],
  tags: [],
  recipes: [],
  films: [],
  focalLengths: [],
  albums: [],
  locations: [],
};

export const getDataForCategories = () => Promise.all([
  SHOW_RECENTS
    ? getPhotosMetaCached({ recent: true })
      .then(({ count, dateRangeCreatedAt }) => count && dateRangeCreatedAt
        ? [{
          count,
          lastModified: new Date(dateRangeCreatedAt?.end ?? ''),
        }] : undefined)
      .catch(() => [])
    : undefined,
  SHOW_YEARS
    ? getUniqueYearsCached()
      .then(sortCategoriesByCount)
      .catch(() => [])
    : undefined,
  SHOW_CAMERAS
    ? getUniqueCamerasCached()
      .then(sortCategoriesByCount)
      .catch(() => [])
    : undefined,
  SHOW_LENSES
    ? getUniqueLensesCached()
      .then(sortCategoriesByCount)
      .catch(() => [])
    : undefined,
  SHOW_TAGS
    ? getUniqueTagsCached()
      .then(tags => sortTagsByCount(tags, TAG_FAVS))
      .catch(() => [])
    : undefined,
  SHOW_RECIPES
    ? getUniqueRecipesCached()
      .then(sortCategoriesByCount)
      .catch(() => [])
    : undefined,
  SHOW_FILMS
    ? getUniqueFilmsCached()
      .then(sortCategoriesByCount)
      .catch(() => [])
    : undefined,
  SHOW_FOCAL_LENGTHS
    ? getUniqueFocalLengthsCached()
      .then(sortFocalLengths)
      .catch(() => [])
    : undefined,
  SHOW_ALBUMS
    ? getAlbumsWithMetaCached()
      .then(sortAlbums)
      .catch(() => [])
    : undefined,
  SHOW_LOCATIONS
    ? getLocationsWithMetaCached()
      .then(sortCategoriesByCount)
      .catch(() => [])
    : undefined,
]).then(([
  recents = [],
  years = [],
  cameras = [],
  lenses = [],
  tags = [],
  recipes = [],
  films = [],
  focalLengths = [],
  albums = [],
  locations = [],
]) => ({
  recents,
  years,
  cameras,
  lenses,
  tags,
  recipes,
  films,
  focalLengths,
  albums,
  locations,
}));

export const getCountsForCategories = async () => {
  const {
    recents,
    years,
    cameras,
    lenses,
    albums,
    locations,
    tags,
    recipes,
    films,
    focalLengths,
  } = await getDataForCategories();

  return {
    recents: recents[0]?.count
      ? { count: recents[0].count }
      : {} as Record<string, number>,
    years: years.reduce((acc, year) => {
      acc[year.year] = year.count;
      return acc;
    }, {} as Record<string, number>),
    albums: albums.reduce((acc, { album, count }) => {
      acc[album.slug] = count;
      return acc;
    }, {} as Record<string, number>),
    locations: locations.reduce((acc, { location, count }) => {
      acc[location.slug] = count;
      return acc;
    }, {} as Record<string, number>),
    cameras: cameras.reduce((acc, camera) => {
      acc[camera.cameraKey] = camera.count;
      return acc;
    }, {} as Record<string, number>),
    lenses: lenses.reduce((acc, lens) => {
      acc[createLensKey(lens.lens)] = lens.count;
      return acc;
    }, {} as Record<string, number>),
    tags: tags.reduce((acc, tag) => {
      acc[tag.tag] = tag.count;
      return acc;
    }, {} as Record<string, number>),
    recipes: recipes.reduce((acc, recipe) => {
      acc[recipe.recipe] = recipe.count;
      return acc;
    }, {} as Record<string, number>),
    films: films.reduce((acc, film) => {
      acc[film.film] = film.count;
      return acc;
    }, {} as Record<string, number>),
    focalLengths: focalLengths.reduce((acc, focalLength) => {
      acc[focalLength.focal] = focalLength.count;
      return acc;
    }, {} as Record<string, number>),
  };
};

export const getLastModifiedForCategories = (
  {
    recents,
    years,
    cameras,
    lenses,
    albums,
    locations,
    tags,
    recipes,
    films,
    focalLengths,
  }: PhotoSetCategories,
  photos: { updatedAt: Date }[],
) => [
  ...recents.map(({ lastModified }) => lastModified),
  ...years.map(({ lastModified }) => lastModified),
  ...cameras.map(({ lastModified }) => lastModified),
  ...lenses.map(({ lastModified }) => lastModified),
  ...albums.map(({ lastModified }) => lastModified),
  ...locations.map(({ lastModified }) => lastModified),
  ...tags.map(({ lastModified }) => lastModified),
  ...recipes.map(({ lastModified }) => lastModified),
  ...films.map(({ lastModified }) => lastModified),
  ...focalLengths.map(({ lastModified }) => lastModified),
  ...photos.map(({ updatedAt }) => updatedAt),
]
  .filter(date => date instanceof Date)
  .sort((a, b) => b.getTime() - a.getTime())[0];
