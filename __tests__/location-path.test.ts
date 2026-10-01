import {
  PATH_ROOT,
  PREFIX_LOCATION,
  getEscapePath,
  getPathComponents,
  isPathLocation,
  isPathLocationPhoto,
  pathForLocation,
  pathForPhoto,
} from '@/app/path';

const PHOTO_ID                      = 'UsKSGcbt';
const LOCATION                      = 'location-name';

const PATH_LOCATION                 = `${PREFIX_LOCATION}/${LOCATION}`;
const PATH_LOCATION_PHOTO           = `${PATH_LOCATION}/${PHOTO_ID}`;

describe('Location paths', () => {
  it('can be generated', () => {
    expect(pathForLocation(LOCATION)).toBe(PATH_LOCATION);
    expect(pathForPhoto({ photo: PHOTO_ID, location: {
      id: '1', title: 'Location Name', slug: LOCATION,
    } as any })).toBe(PATH_LOCATION_PHOTO);
  });
  it('can be classified', () => {
    expect(isPathLocation(PATH_LOCATION)).toBe(true);
    expect(isPathLocationPhoto(PATH_LOCATION_PHOTO)).toBe(true);
    expect(isPathLocation(PATH_LOCATION_PHOTO)).toBe(false);
  });
  it('can be parsed', () => {
    expect(getPathComponents(PATH_LOCATION)).toEqual({
      location: LOCATION,
    });
    expect(getPathComponents(PATH_LOCATION_PHOTO)).toEqual({
      photoId: PHOTO_ID,
      location: LOCATION,
    });
  });
  it('can be escaped', () => {
    expect(getEscapePath(PATH_LOCATION)).toEqual(PATH_ROOT);
    expect(getEscapePath(PATH_LOCATION_PHOTO)).toEqual(PATH_LOCATION);
  });
});
