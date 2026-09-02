import FormWithConfirm from '@/components/FormWithConfirm';
import AdminTable from '@/admin/AdminTable';
import { Fragment } from 'react';
import DeleteFormButton from '@/admin/DeleteFormButton';
import EditButton from '@/admin/EditButton';
import { pathForAdminLocationEdit } from '@/app/path';
import { clsx } from 'clsx/lite';
import { getAppText } from '@/i18n/state/server';
import { Locations, deleteLocationConfirmationText } from '@/location';
import AdminLocationBadge from './AdminLocationBadge';
import { deleteLocationFormAction } from '@/location/actions';

export default async function AdminLocationsTable({
  locations,
}: {
  locations: Locations
}) {
  const appText = await getAppText();
  return (
    <AdminTable>
      {locations.map(({ location, count }) =>
        <Fragment key={location.slug}>
          <div className="pr-2 col-span-2">
            <AdminLocationBadge {...{ location, count }} />
          </div>
          <div className={clsx(
            'flex flex-nowrap',
            'gap-2 sm:gap-3 items-center',
          )}>
            <EditButton path={pathForAdminLocationEdit(location)} />
            <FormWithConfirm
              action={deleteLocationFormAction}
              confirmText={deleteLocationConfirmationText(
                location,
                count,
                appText,
              )}
            >
              <input type="hidden" name="location" value={location.id} />
              <DeleteFormButton clearLocalState />
            </FormWithConfirm>
          </div>
        </Fragment>)}
    </AdminTable>
  );
}
