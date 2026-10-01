import { parameterize } from '@/utility/string';
import {
  addPhotoLocationId,
  clearPhotoLocationIds,
  getLocationsWithMeta,
  insertLocation,
} from './query';

export const createLocationsAndGetIds = async (titles: string[]) => {
  const locations = await getLocationsWithMeta();
  return Promise.all(titles.map(async title => {
    const existing = locations.find(({ location }) =>
      location.title.toLocaleLowerCase() === title.toLocaleLowerCase());
    return existing
      ? existing.location.id
      : insertLocation({ title, slug: parameterize(title) });
  }));
};

export const addLocationTitlesToPhoto = async (
  locationTitles: string[],
  photoId: string,
  shouldClearPhotoLocationIds = true,
) => {
  const locationIds = await createLocationsAndGetIds(locationTitles);
  if (shouldClearPhotoLocationIds) { await clearPhotoLocationIds(photoId); }
  await Promise.all(locationIds.map(locationId =>
    addPhotoLocationId(photoId, locationId)));
};
