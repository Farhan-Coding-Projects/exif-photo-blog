export type MakeModelTextLength =
  'long' |    // Unmodified make and model
  'medium' |  // Make and model, with modifiers removed
  'short';    // Model only

export const convertStringToArray = (
  string?: string,
  shouldParameterize = true,
  shouldSplitOnComma = true,
) => string
  ? (shouldSplitOnComma ? string.split(',') : [string])
    .map(item => shouldParameterize
      ? parameterize(item)
      : item.trim())
  : [];

export const capitalize = (string: string) =>
  string.charAt(0).toLocaleUpperCase() + string.slice(1);

export const capitalizeWords = (string = '') =>
  string
    .split(' ')
    .map(capitalize)
    .join(' ');

// Shared with SQL parameterization (db/index.ts) so both sides match.
// Bracket expressions valid in both JS and Postgres regex.
// Spaces, underscores, pluses, ampersands, pipes, dashes
export const PARAMETERIZE_PATTERN_TO_DASH = '[\\s_–—+&|]';
// Punctuation
export const PARAMETERIZE_PATTERN_TO_REMOVE =
  '[\'"!@#$%^*()=\\[\\]{};:/?,<>\\\\`~]';

export const parameterize = (
  string: string,
  shouldRemoveNonAlphanumeric?: boolean,
) =>
  string
    .trim()
    .replaceAll(new RegExp(PARAMETERIZE_PATTERN_TO_DASH, 'gi'), '-')
    .replaceAll(new RegExp(PARAMETERIZE_PATTERN_TO_REMOVE, 'gi'), '')
    // Removes non-alphanumeric characters, if configured
    // (breaks i18m)
    .replaceAll(
      shouldRemoveNonAlphanumeric
        ? /([^a-z0-9-])/gi
        : /''/gi,
      '',
    )
    .toLocaleLowerCase();

export const formatStringForXml = (string: string) =>
  string
    .replace(/&/g, '&amp;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export const deparameterize = (string: string) =>
  capitalizeWords(string.replaceAll('-', ' '));

export const formatCount = (count: number) => `× ${count}`;

export const pluralize = (
  count: number,
  singular: string,
  plural?: string,
  padPlaces = 0,
) =>{
  const numberFormatted = padPlaces
    ? String(count).padStart(padPlaces, '0')
    : count;
  const label = count === 1 ? singular : plural ?? `${singular}s`;
  return `${numberFormatted} ${label}`;
};

export const depluralize = (string: string) =>
  // Handle plurals like "lenses"
  /ses$/i.test(string)
    ? string.replace(/es$/i, '')
    : string.replace(/s$/i, '');

export const startsWithHangingPunctuation = (text: string) =>
  /^["'“”‘’„‚«»‹›¿¡(\[{—–-]/.test(text);

export const formatCountDescriptive = (
  count: number,
  verb = 'found',
  noun = 'photo',
  singular = '',
  plural = 's',
) =>
  `${verb} in ${count} ${noun}${count === 1 ? singular : plural}`;
