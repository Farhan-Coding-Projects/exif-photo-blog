import AdminLocationsTable from '@/admin/AdminLocationsTable';
import { getLocationsWithMeta } from '@/location/query';
import AppGrid from '@/components/AppGrid';

export default async function AdminLocationsPage() {
  const locations = await getLocationsWithMeta();
  return (
    <AppGrid contentMain={
      <div className="space-y-6">
        <AdminLocationsTable {...{ locations }} />
      </div>
    } />
  );
}
