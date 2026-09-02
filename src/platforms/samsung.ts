const MAKE_SAMSUNG = 'SAMSUNG';

const LABELS = {
  s25UltraWide: 'S25U ULTRAWIDE (2.2MM)',
  s25Main: 'S25U MAIN (6.765MM)',
  s25Telephoto: 'S25U TELEPHOTO (16.89MM)',
  s22UltraWide: 'S22U ULTRAWIDE (2.2MM)',
  s22Main: 'S22U MAIN (5.7MM)',
} as const;

const ALIASES: Record<string, string> = {
  's25 ultrawide': LABELS.s25UltraWide,
  's25u ultrawide (2.2mm)': LABELS.s25UltraWide,
  's25 main': LABELS.s25Main,
  's25u main camera (6.765mm)': LABELS.s25Main,
  's25u main (6.765mm)': LABELS.s25Main,
  's25 telephoto': LABELS.s25Telephoto,
  's25u telephoto camera (16.89mm)': LABELS.s25Telephoto,
  's25u telephoto (16.89mm)': LABELS.s25Telephoto,
  's22 ultrawide': LABELS.s22UltraWide,
  's22u ultrawide (2.2mm)': LABELS.s22UltraWide,
  's22 wide': LABELS.s22Main,
  's22 main': LABELS.s22Main,
  's22u main camera (5.7mm)': LABELS.s22Main,
  's22u main (5.7mm)': LABELS.s22Main,
};

const approximately = (value: number, expected: number) =>
  Math.abs(value - expected) < 0.05;

export const normalizeSamsungLensModel = (
  make?: string,
  model?: string,
  lensModel?: string,
  focalLength?: string | number,
) => {
  if (!make?.toLocaleUpperCase().startsWith(MAKE_SAMSUNG)) {
    return lensModel;
  }

  const alias = lensModel
    ? ALIASES[lensModel.toLocaleLowerCase()]
    : undefined;
  if (alias) { return alias; }

  const modelNormalized = model?.toLocaleUpperCase() ?? '';
  const focal = typeof focalLength === 'number'
    ? focalLength
    : parseFloat(focalLength ?? '');

  const isS25Ultra = modelNormalized.includes('S25 ULTRA') ||
    modelNormalized.startsWith('SM-S938');
  if (isS25Ultra) {
    if (approximately(focal, 2.2)) { return LABELS.s25UltraWide; }
    if (approximately(focal, 6.765)) { return LABELS.s25Main; }
    if (approximately(focal, 16.89)) { return LABELS.s25Telephoto; }
  }

  const isS22Ultra = modelNormalized.includes('S22 ULTRA') ||
    modelNormalized.startsWith('SM-S908');
  if (isS22Ultra) {
    if (approximately(focal, 2.2)) { return LABELS.s22UltraWide; }
    if (approximately(focal, 5.7)) { return LABELS.s22Main; }
  }

  return lensModel;
};
