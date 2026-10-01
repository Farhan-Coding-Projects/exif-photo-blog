import { safelyQuery } from '@/db/query';
import { query, sql } from '@/platforms/postgres';
import { generateManyToManyValues } from '@/db';
import { Location, Locations, parseLocationFromDb } from '.';

export const createLocationsTable = () => sql`
  CREATE TABLE IF NOT EXISTS locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    subhead TEXT,
    description TEXT,
    place JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )
`;

export const createLocationPhotoTable = () => sql`
  CREATE TABLE IF NOT EXISTS location_photo (
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    photo_id VARCHAR(8) NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    PRIMARY KEY (location_id, photo_id)
  )
`;

// Existing installations may have used albums to represent places.
// Seed the independent location system without removing or changing albums.
export const backfillLocationsFromAlbums = async () => {
  await sql`
    INSERT INTO locations (
      id,
      title,
      slug,
      subhead,
      description,
      place,
      updated_at,
      created_at
    )
    SELECT
      id,
      title,
      slug,
      subhead,
      description,
      location,
      updated_at,
      created_at
    FROM albums
    ON CONFLICT DO NOTHING
  `;
  await sql`
    INSERT INTO location_photo (location_id, photo_id, sort_order)
    SELECT l.id, ap.photo_id, ap.sort_order
    FROM albums a
    JOIN locations l ON l.slug = a.slug
    JOIN album_photo ap ON ap.album_id = a.id
    ON CONFLICT (location_id, photo_id) DO NOTHING
  `;
};

let createLocationTablesPromise: Promise<void> | undefined;

export const createLocationTables = () => {
  if (!createLocationTablesPromise) {
    console.log('Creating locations tables ...');
    createLocationTablesPromise = createLocationsTable()
      .then(() => createLocationPhotoTable())
      .then(() => backfillLocationsFromAlbums())
      .then(() => undefined)
      .catch(error => {
        createLocationTablesPromise = undefined;
        throw error;
      });
  }
  return createLocationTablesPromise;
};

export const insertLocation = (location: Omit<Location, 'id'>) =>
  safelyQuery(() => sql`
    INSERT INTO locations (title, slug, subhead, description, place)
    VALUES (
      ${location.title},
      ${location.slug},
      ${location.subhead},
      ${location.description},
      ${location.place ? JSON.stringify(location.place) : null}
    )
    RETURNING id
  `.then(({ rows }) => rows[0]?.id as string), 'insertLocation');

export const updateLocation = (location: Location) =>
  safelyQuery(() => sql`
    UPDATE locations SET
      title=${location.title},
      slug=${location.slug},
      subhead=${location.subhead},
      description=${location.description},
      place=${location.place ? JSON.stringify(location.place) : null},
      updated_at=${(new Date()).toISOString()}
    WHERE id=${location.id}
  `, 'updateLocation');

export const getLocationFromSlug = (slug: string) =>
  safelyQuery(() => sql<Location>`
    SELECT * FROM locations WHERE slug=${slug}
  `.then(({ rows }) => rows[0] ? parseLocationFromDb(rows[0]) : undefined),
  'getLocationFromSlug');

export const deleteLocation = (id: string) =>
  safelyQuery(() => sql`DELETE FROM locations WHERE id=${id}`,
    'deleteLocation');

export const getLocationsWithMeta = () =>
  safelyQuery(() => sql`
    SELECT l.*, COALESCE(COUNT(lp.photo_id), 0) as count
    FROM locations l
    LEFT JOIN location_photo lp ON l.id = lp.location_id
    GROUP BY l.id
    ORDER BY COUNT(lp.photo_id) DESC, l.title ASC
  `.then(({ rows }): Locations => rows.map(({ count, ...location }) => ({
      location: parseLocationFromDb(location),
      count: parseInt(count, 10),
      lastModified: location.updated_at as Date,
    }))), 'getLocationsWithMeta');

export const clearPhotoLocationIds = (photoId: string) =>
  safelyQuery(() => sql`DELETE FROM location_photo WHERE photo_id=${photoId}`,
    'clearPhotoLocationIds');

export const addPhotoLocationIds = (
  photoIds: string[],
  locationIds: string[],
) => {
  if (photoIds.length > 0 && locationIds.length > 0) {
    const { valueString, values } = generateManyToManyValues(
      locationIds,
      photoIds,
    );
    return safelyQuery(() => query(`
      INSERT INTO location_photo (location_id, photo_id)
      ${valueString}
      ON CONFLICT (location_id, photo_id) DO NOTHING
    `, values), 'addPhotoLocationIds');
  }
};

export const addPhotoLocationId = (photoId: string, locationId: string) =>
  addPhotoLocationIds([photoId], [locationId]);

export const getLocationTitlesForPhoto = (photoId: string) =>
  safelyQuery(() => sql<{ title: string }>`
    SELECT l.title FROM locations l
    JOIN location_photo lp ON l.id = lp.location_id
    WHERE lp.photo_id=${photoId}
  `.then(({ rows }) => rows.map(({ title }) => title)),
  'getLocationTitlesForPhoto');

export const getLocationsForPhoto = (photoId: string) =>
  safelyQuery(() => sql`
    SELECT l.* FROM locations l
    JOIN location_photo lp ON l.id = lp.location_id
    WHERE lp.photo_id=${photoId}
    ORDER BY l.title ASC
  `.then(({ rows }) => rows.map(parseLocationFromDb)),
  'getLocationsForPhoto');

export const getTagsForLocation = (locationId: string) =>
  safelyQuery(() => sql`
    SELECT DISTINCT unnest(p.tags) as tag
    FROM photos p
    LEFT JOIN location_photo lp ON p.id = lp.photo_id
    WHERE location_id=${locationId}
  `.then(({ rows }) => rows.map(({ tag }) => tag)), 'getTagsForLocation');
