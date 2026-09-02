import { Photo, PhotoDateRangePostgres } from '@/photo';
import PhotoGridContainer from '@/photo/PhotoGridContainer';
import { Location } from '.';
import LocationHeader from './LocationHeader';

export default function LocationOverview({
  location,
  photos,
  count,
  dateRange,
}: {
  location: Location
  photos: Photo[]
  count: number
  dateRange?: PhotoDateRangePostgres
}) {
  return (
    <PhotoGridContainer
      cacheKey={`location-${location.slug}`}
      photos={photos}
      count={count}
      location={location}
      header={<LocationHeader
        location={location}
        photos={photos}
        count={count}
        dateRange={dateRange}
        showLocationMeta
      />}
      animateOnFirstLoadOnly
    />
  );
}
