import { ComponentProps, useEffect, useRef } from 'react';
import FieldsetWithStatus from '@/components/FieldsetWithStatus';
import { Locations } from '.';
import { convertLocationsToAnnotatedTags } from './form';

export default function FieldsetLocation({
  locationOptions,
  label,
  openOnLoad,
  ...props
}: {
  locationOptions: Locations
  label?: string
  openOnLoad?: boolean
} & Omit<ComponentProps<typeof FieldsetWithStatus>, 'label'>) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (openOnLoad) {
      const timeout = setTimeout(() =>
        ref.current?.querySelectorAll('input')[0]?.focus(), 100);
      return () => clearTimeout(timeout);
    }
  }, [openOnLoad]);
  return (
    <div ref={ref}>
      <FieldsetWithStatus
        {...props}
        label={label ?? 'Locations'}
        tagOptions={convertLocationsToAnnotatedTags(locationOptions)}
        tagOptionsShouldParameterize={false}
      />
    </div>
  );
}
