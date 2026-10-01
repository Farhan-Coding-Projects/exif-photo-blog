import { Photo, PhotoDateRangePostgres } from '@/photo';
import PhotoHeader from '@/photo/PhotoHeader';
import { getAppText } from '@/i18n/state/server';
import {
  Location,
  descriptionForLocationPhotos,
  locationHasMeta,
} from '.';
import { safelyParseFormattedHtml } from '@/utility/html';
import PhotoLocation from './PhotoLocation';
import PlaceEntity from '@/place/PlaceEntity';
import { AI_CONTENT_GENERATION_ENABLED } from '@/app/config';

export default async function LocationHeader({
  location,
  photos,
  selectedPhoto,
  indexNumber,
  count,
  dateRange,
  showLocationMeta,
}: {
  location: Location
  photos: Photo[]
  selectedPhoto?: Photo
  indexNumber?: number
  count?: number
  dateRange?: PhotoDateRangePostgres
  showLocationMeta?: boolean
}) {
  const appText = await getAppText();
  return (
    <PhotoHeader
      location={location}
      entity={<PhotoLocation
        location={location}
        contrast="high"
        hoverType="none"
      />}
      entityDescription={descriptionForLocationPhotos(
        photos,
        appText,
        count,
        dateRange,
      )}
      photos={photos}
      selectedPhoto={selectedPhoto}
      indexNumber={indexNumber}
      count={count}
      dateRange={dateRange}
      hasAiTextGeneration={AI_CONTENT_GENERATION_ENABLED}
      richContent={showLocationMeta && locationHasMeta(location)
        ? <div className="space-y-2">
          {location.subhead &&
            <div className="text-medium mb-6 uppercase font-medium">
              {location.subhead}
            </div>}
          {location.place && <PlaceEntity place={location.place} />}
          {location.description &&
            <div
              className="text-medium [&>a]:underline"
              dangerouslySetInnerHTML={{
                __html: safelyParseFormattedHtml(location.description),
              }}
            />}
        </div>
        : undefined}
    />
  );
}
