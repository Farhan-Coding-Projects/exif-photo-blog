import AdminBadge from './AdminBadge';
import { Location } from '@/location';
import PhotoLocation from '@/location/PhotoLocation';

export default async function AdminLocationBadge({
  location,
  count,
  hideBadge,
}: {
  location: Location
  count: number
  hideBadge?: boolean
}) {
  return (
    <AdminBadge
      entity={<PhotoLocation {...{ location }} hoverType="none" />}
      count={count}
      hideBadge={hideBadge}
    />
  );
}
