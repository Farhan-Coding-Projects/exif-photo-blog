import { getUniqueTagsCached } from '@/photo/cache';
import { getAlbumsWithMetaCached } from '@/album/cache';
import AdminBatchEditPanelClient from './AdminBatchEditPanelClient';
import { getLocationsWithMetaCached } from '@/location/cache';

export default async function AdminBatchEditPanel({
  onBatchActionComplete,
}: {
  onBatchActionComplete?: () => Promise<void>
}) {
  const uniqueAlbums = await getAlbumsWithMetaCached().catch(() => []);
  const uniqueLocations = await getLocationsWithMetaCached().catch(() => []);
  const uniqueTags = await getUniqueTagsCached().catch(() => []);
  return (
    <AdminBatchEditPanelClient {...{
      uniqueAlbums,
      uniqueLocations,
      uniqueTags,
      onBatchActionComplete,
    }} />
  );
}
