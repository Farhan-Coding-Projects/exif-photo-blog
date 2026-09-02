'use server';

import { runAuthenticatedAdminServerAction } from '@/auth/server';
import { deleteLocation, updateLocation } from './query';
import { revalidateAllKeysAndPaths } from '@/cache';
import { redirect } from 'next/navigation';
import { PATH_ADMIN_LOCATIONS, PATH_ROOT, pathForLocation } from '@/app/path';
import { convertFormDataToLocation } from './form';
import { Location } from '.';

export const updateLocationAction = async (formData: FormData) =>
  runAuthenticatedAdminServerAction(async () => {
    await updateLocation(convertFormDataToLocation(formData));
    revalidateAllKeysAndPaths();
    redirect(PATH_ADMIN_LOCATIONS);
  });

export const deleteLocationFormAction = async (formData: FormData) =>
  runAuthenticatedAdminServerAction(async () => {
    await deleteLocation(formData.get('location') as string);
    revalidateAllKeysAndPaths();
  });

export const deleteLocationAction = async (
  location: Location,
  currentPath?: string,
) => runAuthenticatedAdminServerAction(async () => {
  await deleteLocation(location.id);
  revalidateAllKeysAndPaths();
  if (currentPath === pathForLocation(location)) { redirect(PATH_ROOT); }
});
