'use client';

import EntityLink, { EntityLinkExternalProps } from
  '@/components/entity/EntityLink';
import { pathForLocation } from '@/app/path';
import { Location } from '.';
import { TbMapPin } from 'react-icons/tb';
import useCategoryCounts from '@/category/useCategoryCounts';

export default function PhotoLocation({
  location,
  ...props
}: {
  location: Location
} & EntityLinkExternalProps) {
  const { getLocationCount } = useCategoryCounts();
  const hoverCount = props.hoverCount ?? getLocationCount(location);
  return (
    <EntityLink
      {...props}
      path={pathForLocation(location)}
      label={location.title}
      icon={<TbMapPin />}
      hoverQueryOptions={{ location }}
      hoverCount={hoverCount}
    />
  );
}
