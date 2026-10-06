'use client';

import { AiFillApple } from 'react-icons/ai';
import { pathForCamera } from '@/app/path';
import {
  Camera,
  formatCameraText,
  formatCameraTextWithoutPhoneMake,
  isCameraMakeImpliedByModel,
} from '.';
import EntityLink, {
  EntityLinkExternalProps,
} from '@/components/entity/EntityLink';
import IconCamera from '@/components/icons/IconCamera';
import { isCameraApple } from '@/platforms/apple';
import IconCameraMake, {
  getCameraMakeMark,
  isCameraMakeMarkWide,
} from '@/custom/IconCameraMake';
import useCategoryCounts from '@/category/useCategoryCounts';
import { getCameraBrand } from './brand';
import CameraBrand from './CameraBrand';

export default function PhotoCamera({
  camera,
  hideAppleIcon,
  showBrandLogo,
  hidePhoneMake,
  ...props
}: {
  camera: Camera
  hideAppleIcon?: boolean
  showBrandLogo?: boolean
  // Show only the phone model (e.g. "Galaxy S25 Ultra")
  hidePhoneMake?: boolean
} & EntityLinkExternalProps) {
  const { getCameraCount } = useCategoryCounts();

  const isApple = isCameraApple(camera);
  const showAppleIcon = !hideAppleIcon && isApple;
  const makeMark = hideAppleIcon
    ? undefined
    : getCameraMakeMark(camera.make);
  const brand = showBrandLogo
    ? getCameraBrand(camera.make)
    : undefined;
  const hideMake = !brand &&
    hidePhoneMake &&
    isCameraMakeImpliedByModel(camera);

  return (
    <EntityLink
      {...props}
      label={brand
        ? <>
          <CameraBrand brand={brand} />{formatCameraText(camera, 'short')}
        </>
        : hidePhoneMake
          ? formatCameraTextWithoutPhoneMake(camera)
          : formatCameraText(camera)}
      labelForHover={brand || hideMake
        ? formatCameraText(camera)
        : undefined}
      path={pathForCamera(camera)}
      hoverQueryOptions={{ camera }}
      icon={showAppleIcon
        ? <AiFillApple
          title="Apple"
          className="translate-x-[-0.5px] translate-y-[-1px]"
          size={16}
        />
        : makeMark
          ? <IconCameraMake
            mark={makeMark}
            className="translate-y-[-1px]"
          />
          : <IconCamera
            size={15}
            className="translate-x-[-0.5px] translate-y-[-0.5px]"
          />}
      iconWide={isCameraMakeMarkWide(makeMark)}
      hoverCount={props.hoverCount ?? getCameraCount(camera)}
    />
  );
}
