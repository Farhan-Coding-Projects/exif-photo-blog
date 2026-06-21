export const MAKE_DJI = 'DJI';

export const isMakeDji = (make?: string) =>
  Boolean(make?.toLocaleUpperCase().startsWith(MAKE_DJI));

// Map internal DJI sensor/model identifiers to friendly product names
const DJI_MODEL_LABELS: Record<string, string> = {
  FC7703: 'Mini 4K',
};

export const formatDjiModel = (model: string) =>
  DJI_MODEL_LABELS[model.toLocaleUpperCase()] ?? model;
