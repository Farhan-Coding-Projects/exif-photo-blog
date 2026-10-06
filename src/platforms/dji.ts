export const MAKE_DJI = 'DJI';

export const isMakeDji = (make?: string) =>
  Boolean(make?.toLocaleUpperCase().startsWith(MAKE_DJI));

// Map internal DJI sensor/model identifiers to friendly product names
const DJI_MODEL_LABELS: Record<string, string> = {
  FC7703: 'Mini 4K',
};

export const formatDjiModel = (model: string) =>
  DJI_MODEL_LABELS[model.toLocaleUpperCase()] ?? model;

const DJI_MINI_4K_MODEL = 'FC7703';
// 24mm is the full-frame equivalent of the 4.49mm lens
const DJI_MINI_4K_LENS_LABEL = 'Mini 4K (24mm)';
const DJI_MINI_4K_LENS_ALIASES = [
  '20.7 mm',
  'Mini 4K',
  'Mini 4K (20.7 mm)',
  'DJI Main Camera',
  'Mini 4K Main Camera',
  'MINI 4K MAIN CAMERA (20.7MM)',
  DJI_MINI_4K_LENS_LABEL,
];

export const normalizeDjiLensModel = (
  make?: string,
  model?: string,
  lensModel?: string,
) => isMakeDji(make) &&
  model?.toLocaleUpperCase() === DJI_MINI_4K_MODEL &&
  lensModel &&
  DJI_MINI_4K_LENS_ALIASES.some(alias =>
    alias.toLocaleLowerCase() === lensModel.toLocaleLowerCase())
  ? DJI_MINI_4K_LENS_LABEL
  : lensModel;

// Lens labels stored before the 24mm label was introduced
export const formatDjiLensText = (lensModel: string) =>
  DJI_MINI_4K_LENS_ALIASES.some(alias =>
    alias.toLocaleLowerCase() === lensModel.toLocaleLowerCase())
    ? DJI_MINI_4K_LENS_LABEL
    : lensModel;
