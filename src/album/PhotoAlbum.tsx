'use client';

import { pathForAlbum } from '@/app/path';
import EntityLink, { EntityLinkExternalProps } from
  '@/components/entity/EntityLink';
import IconAlbum from '@/components/icons/IconAlbum';
import { Album, isAlbumFavorites } from '.';
import useCategoryCounts from '@/category/useCategoryCounts';
import AdminAlbumMenu from './AdminAlbumMenu';
import { useAppState } from '@/app/AppState';
import IconFavs from '@/components/icons/IconFavs';

export default function PhotoAlbum({
  album,
  showAdminMenu,
  ...props
}: {
  album: Album
  showAdminMenu?: boolean
} & EntityLinkExternalProps) {
  const { getAlbumCount } = useCategoryCounts();
  const { isUserSignedIn } = useAppState();
  const count = props.hoverCount ?? getAlbumCount(album);
  const isFavorites = isAlbumFavorites(album);
  const favoritesIcon = <IconFavs
    size={12}
    className="translate-y-[-0.5px]"
    highlight
  />;
  return (
    <EntityLink
      {...props}
      label={album.title}
      path={pathForAlbum(album)}
      hoverQueryOptions={{ album }}
      icon={isFavorites
        ? favoritesIcon
        : <IconAlbum className="translate-y-[-0.5px]" />}
      iconBadgeStart={isFavorites ? favoritesIcon : undefined}
      hoverCount={props.hoverCount ?? getAlbumCount(album)}
      action={showAdminMenu && isUserSignedIn &&
        <AdminAlbumMenu {...{ album, count }} />}
    />
  );
}
