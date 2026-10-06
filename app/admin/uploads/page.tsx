import { getStorageUploadUrlsNoStore } from '@/platforms/storage/cache';
import AppGrid from '@/components/AppGrid';
import { getUniqueTagsCached } from '@/photo/cache';
import { getAlbumsWithMetaCached } from '@/album/cache';
import AdminUploadsClient from '@/admin/AdminUploadsClient';
import { PRESERVE_ORIGINAL_UPLOADS } from '@/app/config';
import { getLocationsWithMetaCached } from '@/location/cache';

export const maxDuration = 60;

export default async function AdminUploadsPage() {
  const urls = await getStorageUploadUrlsNoStore();

  const [uniqueAlbums, uniqueLocations, uniqueTags] = urls.length > 0
    ? await Promise.all([
      getAlbumsWithMetaCached(),
      getLocationsWithMetaCached(),
      getUniqueTagsCached(),
    ])
    : [[], [], []];

  return (
    <AppGrid
      contentMain={
        <AdminUploadsClient {...{
          urls,
          uniqueAlbums,
          uniqueLocations,
          uniqueTags,
          shouldResize: !PRESERVE_ORIGINAL_UPLOADS,
        }} />}
    />
  );
}
