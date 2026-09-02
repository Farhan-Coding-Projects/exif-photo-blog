import { redirect } from 'next/navigation';
import { PATH_ADMIN, PATH_ADMIN_LOCATIONS, pathForLocation } from '@/app/path';
import { getPhotosCached, getPhotosMetaCached } from '@/photo/cache';
import { getLocationFromSlug } from '@/location/query';
import AdminLocationBadge from '@/admin/AdminLocationBadge';
import AdminLocationForm from '@/admin/AdminLocationForm';
import { HAS_LOCATION_SERVICES } from '@/app/config';
import AdminChildPage from '@/components/AdminChildPage';
import PhotoLightbox from '@/photo/PhotoLightbox';

const MAX_PHOTO_TO_SHOW = 6;

export default async function LocationPageEdit({
  params,
}: {
  params: Promise<{ location: string }>
}) {
  const { location: locationFromParams } = await params;
  const location = await getLocationFromSlug(
    decodeURIComponent(locationFromParams),
  );
  if (!location) { redirect(PATH_ADMIN); }
  const [meta, photos] = await Promise.all([
    getPhotosMetaCached({ location }),
    getPhotosCached({ location, limit: MAX_PHOTO_TO_SHOW }),
  ]);
  return (
    <AdminChildPage
      backPath={PATH_ADMIN_LOCATIONS}
      backLabel="Locations"
      breadcrumb={<AdminLocationBadge
        location={location}
        count={meta.count}
        hideBadge
      />}
    >
      <AdminLocationForm
        location={location}
        hasLocationServices={HAS_LOCATION_SERVICES}
      >
        {photos.length > 0 &&
          <PhotoLightbox
            count={meta.count}
            photos={photos}
            location={location}
            maxPhotosToShow={MAX_PHOTO_TO_SHOW}
            moreLink={pathForLocation(location)}
          />}
      </AdminLocationForm>
    </AdminChildPage>
  );
}
