import { getStorageUploadUrlsNoStore } from '@/platforms/storage/cache';
import AppGrid from '@/components/AppGrid';
import { getUniqueTagsCached } from '@/photo/cache';
import { getAlbumsWithMetaCached } from '@/album/cache';
import AdminUploadsClient from '@/admin/AdminUploadsClient';
import { redirect } from 'next/navigation';
import { PATH_ADMIN_PHOTOS } from '@/app/path';
import { getLocationsWithMetaCached } from '@/location/cache';

export const maxDuration = 60;

export default async function AdminUploadsPage() {
  const urls = await getStorageUploadUrlsNoStore();
  const uniqueAlbums = await getAlbumsWithMetaCached();
  const uniqueLocations = await getLocationsWithMetaCached();
  const uniqueTags = await getUniqueTagsCached();

  if (urls.length === 0) {
    redirect(PATH_ADMIN_PHOTOS);
  } else {
    return (
      <AppGrid
        contentMain={
          <AdminUploadsClient {...{
            urls,
            uniqueAlbums,
            uniqueLocations,
            uniqueTags,
          }} />}
      />
    );
  }
}
