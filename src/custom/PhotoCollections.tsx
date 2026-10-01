import PhotoAlbum from '@/album/PhotoAlbum';
import { Album } from '@/album';
import PhotoLocation from '@/location/PhotoLocation';
import { Location } from '@/location';
import { EntityLinkExternalProps } from '@/components/entity/EntityLink';

// Locations and albums a photo belongs to, shown in photo detail meta
export default function PhotoCollections({
  locations = [],
  albums = [],
  contrast,
  prefetch,
}: {
  locations?: Location[]
  albums?: Album[]
} & EntityLinkExternalProps) {
  if (locations.length === 0 && albums.length === 0) { return null; }
  return (
    <div className="flex flex-col *:self-start">
      {locations.map(location =>
        <PhotoLocation
          key={location.slug}
          location={location}
          contrast={contrast}
          prefetch={prefetch}
        />)}
      {albums.map(album =>
        <PhotoAlbum
          key={album.slug}
          album={album}
          contrast={contrast}
          prefetch={prefetch}
        />)}
    </div>
  );
}
