import { Photo, PhotoDateRangePostgres } from '@/photo';
import PhotoGridHybridContainer from '@/photo/PhotoGridHybridContainer';
import { Location } from '.';
import LocationHeader from './LocationHeader';

export default function LocationOverview({
  location,
  photos,
  count,
  dateRange,
  animateOnFirstLoadOnly,
}: {
  location: Location,
  photos: Photo[],
  count: number,
  dateRange?: PhotoDateRangePostgres,
  animateOnFirstLoadOnly?: boolean,
}) {
  return (
    <PhotoGridHybridContainer {...{
      cacheKey: `location-${location.slug}`,
      photos,
      count,
      location,
      header: <LocationHeader {...{
        location,
        photos,
        count,
        dateRange,
        showLocationMeta: true,
      }} />,
      animateOnFirstLoadOnly,
    }} />
  );
}
