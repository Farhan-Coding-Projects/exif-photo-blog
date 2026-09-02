import { AnnotatedTag, FieldSetType } from '@/photo/form';
import { Location, Locations } from '.';
import { formatCount, formatCountDescriptive } from '@/utility/string';

export const LOCATION_FORM_META: {
  key: keyof Location
  label?: string
  type: FieldSetType
  required?: boolean
  readOnly?: boolean
}[] = [
  { key: 'id', type: 'hidden', readOnly: true },
  { key: 'title', type: 'text', required: true },
  { key: 'slug', type: 'text', required: true, readOnly: true },
  { key: 'subhead', type: 'text' },
  { key: 'description', type: 'textarea' },
];

export const convertFormDataToLocation = (formData: FormData): Location => {
  const placeString = formData.get('place') as string | undefined;
  return {
    id: formData.get('id') as string,
    title: formData.get('title') as string,
    slug: formData.get('slug') as string,
    subhead: formData.get('subhead') as string,
    description: formData.get('description') as string,
    ...placeString && { place: JSON.parse(placeString) },
  };
};

export const convertLocationsToAnnotatedTags = (
  locations: Locations = [],
): AnnotatedTag[] => locations
  .sort((a, b) =>
    b.count - a.count || a.location.title.localeCompare(b.location.title))
  .map(({ location, count }) => ({
    value: location.title,
    annotation: formatCount(count),
    annotationAria: formatCountDescriptive(count),
  }));

export const getLocationTitlesFromFormData = (formData: FormData) =>
  formData.get('locations')?.toString().split(',').filter(Boolean) ?? [];
