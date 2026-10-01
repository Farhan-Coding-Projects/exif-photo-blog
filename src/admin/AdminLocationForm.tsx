'use client';

import SubmitButtonWithStatus from '@/components/SubmitButtonWithStatus';
import Link from 'next/link';
import { PATH_ADMIN_LOCATIONS } from '@/app/path';
import FieldsetWithStatus from '@/components/FieldsetWithStatus';
import { ReactNode, useCallback, useMemo, useState } from 'react';
import { useAppState } from '@/app/AppState';
import { Location } from '@/location';
import { LOCATION_FORM_META } from '@/location/form';
import { parameterize } from '@/utility/string';
import { updateLocationAction } from '@/location/actions';
import clsx from 'clsx/lite';
import PlaceInput from '@/place/PlaceInput';
import { convertPlaceToAutocomplete, Place } from '@/place';
import deepEqual from 'fast-deep-equal/es6/react';

export default function AdminLocationForm({
  location,
  hasLocationServices,
  children,
}: {
  location: Location
  hasLocationServices?: boolean
  children?: ReactNode
}) {
  const { invalidateSwr } = useAppState();
  const [locationForm, setLocationForm] = useState<Location>(location);
  const initialPlace = useMemo(() =>
    convertPlaceToAutocomplete(location.place), [location.place]);
  const [isLoadingPlace, setIsLoadingPlace] = useState(false);
  const setPlace = useCallback((place?: Place) =>
    setLocationForm(form => ({ ...form, place })), []);
  const isFormValid = useMemo(() => LOCATION_FORM_META.every(
    ({ key, required }) => !required || Boolean(locationForm[key]),
  ), [locationForm]);

  return (
    <form action={updateLocationAction} className="max-w-[38rem] space-y-4">
      {LOCATION_FORM_META.map(({ key, label, type, readOnly }) =>
        <FieldsetWithStatus
          key={key}
          id={key}
          type={type}
          label={label ?? key}
          value={locationForm[key] ? `${locationForm[key]}` : ''}
          onChange={value => setLocationForm(form => ({
            ...form,
            [key]: value,
            ...key === 'title' && { slug: parameterize(value) },
          }))}
          isModified={locationForm[key] !== location[key]}
          readOnly={readOnly}
          className={clsx(key === 'description' && '[&_textarea]:h-36')}
        />)}
      {hasLocationServices &&
        <PlaceInput
          initialPlace={initialPlace}
          setPlace={setPlace}
          setIsLoadingPlace={setIsLoadingPlace}
          className="relative z-1"
        />}
      {(locationForm.place || isLoadingPlace) &&
        <div className="space-y-4 w-full">
          <FieldsetWithStatus
            label="Location Display Name"
            value={locationForm.place?.nameFormatted ??
              locationForm.place?.name ?? ''}
            onChange={value => setLocationForm(form => ({
              ...form,
              ...form.place && {
                place: { ...form.place, nameFormatted: value },
              },
            }))}
            isModified={
              (locationForm.place?.nameFormatted ??
                locationForm.place?.name) !==
              (location.place?.nameFormatted ?? location.place?.name)
            }
            readOnly={isLoadingPlace}
          />
          <FieldsetWithStatus
            id="place"
            label="Place Data"
            type="textarea"
            value={JSON.stringify(locationForm.place)}
            isModified={!deepEqual(locationForm.place, location.place)}
            readOnly={isLoadingPlace || hasLocationServices}
          />
        </div>}
      {children}
      <div className="flex gap-3">
        <Link className="button" href={PATH_ADMIN_LOCATIONS}>Cancel</Link>
        <SubmitButtonWithStatus
          disabled={!isFormValid}
          onFormSubmit={invalidateSwr}
        >
          Update
        </SubmitButtonWithStatus>
      </div>
    </form>
  );
}
