const MAX_PARAMETERS = 1000;
const MAX_DEPTH = 5;
// The engine's default `maxValuesPerFacet`. Larger indices stay object keys,
// so a URL can't make the parser allocate a huge array.
const MAX_ARRAY_LENGTH = 100;

type QueryObject = Record<string, unknown>;

const hasOwn = (object: object, key: PropertyKey): boolean =>
  Object.prototype.hasOwnProperty.call(object, key);

const isContainer = (value: unknown): value is QueryObject =>
  typeof value === 'object' && value !== null;

function encode(value: string): string {
  let encoded: string;

  try {
    encoded = encodeURIComponent(value);
  } catch (error) {
    // Lone surrogates have no UTF-8 encoding, `qs` writes U+FFFD instead.
    encoded = encodeURIComponent(
      value.replace(
        /[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDFFF]/g,
        (match) => (match.length > 1 ? match : '\uFFFD')
      )
    );
  }

  // RFC 3986 reserves these characters, `encodeURIComponent` doesn't encode them.
  return encoded.replace(
    /[!'()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function decode(value: string): string {
  const withSpaces = value.replace(/\+/g, ' ');

  try {
    return decodeURIComponent(withSpaces);
  } catch (error) {
    return withSpaces;
  }
}

/**
 * Writes the same query string as `qs.stringify(value)`: nested keys and array
 * indices in brackets, `null` as an empty value, and no `undefined` values or
 * empty arrays and objects.
 */
export function stringifyQueryString(value: unknown): string {
  const parameters: string[] = [];

  const add = (current: unknown, key: string) => {
    const item = current instanceof Date ? current.toISOString() : current;

    if (
      item !== null &&
      (typeof item === 'object' || typeof item === 'function')
    ) {
      Object.keys(item).forEach((childKey) => {
        add((item as QueryObject)[childKey], `${key}[${childKey}]`);
      });
    } else if (item !== undefined) {
      parameters.push(
        `${encode(key)}=${encode(item === null ? '' : String(item))}`
      );
    }
  };

  if (isContainer(value)) {
    Object.keys(value).forEach((key) => add(value[key], key));
  }

  return parameters.join('&');
}

/**
 * Splits `a[b][c]` into `['a', '[b]', '[c]']` like `qs`: brackets can nest,
 * levels after the fifth stay a single segment, and a key that names an
 * `Object.prototype` property is ignored.
 */
function splitKey(key: string): string[] | null {
  const segments: string[] = [];
  let open = key.indexOf('[');
  const parent = open === -1 ? key : key.slice(0, open);

  if (parent) {
    if (hasOwn(Object.prototype, parent)) {
      return null;
    }
    segments.push(parent);
  }

  for (let depth = 0; open !== -1 && depth < MAX_DEPTH; depth++) {
    let level = 0;
    let close = -1;

    for (let i = open; i < key.length && close === -1; i++) {
      if (key[i] === '[') {
        level++;
      } else if (key[i] === ']') {
        level--;
        if (level === 0) {
          close = i;
        }
      }
    }

    if (close === -1) {
      break;
    }

    const segment = key.slice(open, close + 1);
    if (hasOwn(Object.prototype, segment.slice(1, -1))) {
      return null;
    }
    segments.push(segment);
    open = key.indexOf('[', close + 1);
  }

  if (open !== -1) {
    segments.push(`[${key.slice(open)}]`);
  }

  return segments;
}

function nest(segments: string[], value: unknown): unknown {
  return segments.reduceRight<unknown>((leaf, segment) => {
    if (segment === '[]') {
      return ([] as unknown[]).concat(leaf);
    }

    const key =
      segment[0] === '[' && segment[segment.length - 1] === ']'
        ? segment.slice(1, -1)
        : segment;
    const index = parseInt(key, 10);

    if (
      key !== segment &&
      String(index) === key &&
      index >= 0 &&
      index < MAX_ARRAY_LENGTH
    ) {
      const array: unknown[] = [];
      array[index] = leaf;
      return array;
    }

    return { [key]: leaf };
  }, value);
}

function merge(target: unknown, source: unknown): unknown {
  if (!source) {
    return target;
  }

  if (!isContainer(source)) {
    if (Array.isArray(target)) {
      target.push(source);
      return target;
    }
    return [target, source];
  }

  if (!isContainer(target)) {
    return ([target] as unknown[]).concat(source);
  }

  if (Array.isArray(target) && Array.isArray(source)) {
    source.forEach((item: unknown, index) => {
      if (!hasOwn(target, index)) {
        target[index] = item;
      } else if (isContainer(target[index]) && isContainer(item)) {
        target[index] = merge(target[index], item);
      } else {
        target.push(item);
      }
    });
    return target;
  }

  const result: QueryObject = Array.isArray(target) ? { ...target } : target;
  Object.keys(source).forEach((key) => {
    result[key] = hasOwn(result, key)
      ? merge(result[key], source[key])
      : source[key];
  });
  return result;
}

function compact(value: unknown): unknown {
  if (Array.isArray(value)) {
    const items: unknown[] = [];
    value.forEach((item: unknown) => {
      items.push(compact(item));
    });
    return items.length > MAX_ARRAY_LENGTH ? { ...items } : items;
  }

  if (isContainer(value)) {
    Object.keys(value).forEach((key) => {
      value[key] = compact(value[key]);
    });
  }

  return value;
}

/**
 * Reads a query string like `qs.parse(search, { arrayLimit: 99 })`, with the
 * same limits on untrusted input: at most 1000 parameters, 5 levels of
 * nesting and 100 items per array, and no `Object.prototype` keys.
 */
export function parseQueryString(search: string): QueryObject {
  const values: QueryObject = Object.create(null);

  search
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
    .split('&', MAX_PARAMETERS)
    .forEach((parameter) => {
      const bracketEqualsIndex = parameter.indexOf(']=');
      const separatorIndex =
        bracketEqualsIndex === -1
          ? parameter.indexOf('=')
          : bracketEqualsIndex + 1;
      const key = decode(
        separatorIndex === -1 ? parameter : parameter.slice(0, separatorIndex)
      );
      const value =
        separatorIndex === -1
          ? ''
          : decode(parameter.slice(separatorIndex + 1));

      values[key] = hasOwn(values, key)
        ? ([] as unknown[]).concat(values[key], value)
        : value;
    });

  let result: unknown = {};
  Object.keys(values).forEach((key) => {
    const segments = key ? splitKey(key) : null;
    if (segments) {
      result = merge(result, nest(segments, values[key]));
    }
  });

  return compact(result) as QueryObject;
}
