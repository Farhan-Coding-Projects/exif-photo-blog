import { convertNumberToRomanNumeral } from '@/utility/number';

export const MAKE_SONY = 'SONY';

export const isMakeSony = (make: string) =>
  make === MAKE_SONY;

export const formatSonyModel = (model: string) => {
  const [
    _,
    type,
    series,
    letter,
    version,
    modifier,
  ] = /^(ILCE|ILME)-([0-9]*)([a-ln-z]*)M*([0-9]*)([a-z]*)/gi.exec(model) ?? [];
  const versionNumber = parseInt(version || '0');
  const versionRomanNumeral = versionNumber > 1 && versionNumber < 10
    ? ` ${convertNumberToRomanNumeral(versionNumber)}`
    : '';
  if (type === 'ILCE' || type === 'ILME') {
    return type === 'ILCE'
      ? `A${series}${letter}${versionRomanNumeral || version}${modifier}`
      : `FX${series}${version}`;
  }
  return model;
};

const SONY_LENS_LABELS: Record<string, string> = {
  'e pz 16-50mm f3.5-5.6 oss': 'SONY 16–50MM F3.5–5.6',
  '16–50mm': 'SONY 16–50MM F3.5–5.6',
  'sony 16–50mm f/3.5–5.6': 'SONY 16–50MM F3.5–5.6',
  'sony 16–50mm f3.5–5.6': 'SONY 16–50MM F3.5–5.6',
  'e 55-210mm f4.5-6.3 oss': 'SONY 55–210MM F4.5–6.3',
  'sony 55–210mm f/4.5–6.3': 'SONY 55–210MM F4.5–6.3',
  'sony 55–210mm f4.5–6.3': 'SONY 55–210MM F4.5–6.3',
};

export const normalizeSonyLensModel = (
  make?: string,
  lensModel?: string,
) => make?.toLocaleUpperCase() === MAKE_SONY && lensModel
  ? SONY_LENS_LABELS[lensModel.toLocaleLowerCase()] ?? lensModel
  : lensModel;
