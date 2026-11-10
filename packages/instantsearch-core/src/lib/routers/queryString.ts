/*
 * Query strings in the format of qs@6.17.1 (https://github.com/ljharb/qs), as
 * the history router wrote and read them with `qs.stringify(routeState)` and
 * `qs.parse(search, { arrayLimit: 99 })`. The parsing is ported from its
 * `lib/parse.js` and `lib/utils.js`.
 *
 * BSD 3-Clause License
 *
 * Copyright (c) 2014, Nathan LaFreniere and other contributors
 * (https://github.com/ljharb/qs/graphs/contributors)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { warning } from '../utils';

const MAX_PARAMETERS = 1000;
const MAX_DEPTH = 5;
// Allows 100 items, the engine's default `maxValuesPerFacet`. Larger indices
// stay object keys, so a URL can't make the parser allocate a huge array.
const DEFAULT_ARRAY_LIMIT = 99;

type QueryObject = Record<string, unknown>;

export type ParsedQueryString = {
  [key: string]:
    | undefined
    | string
    | string[]
    | ParsedQueryString
    | ParsedQueryString[];
};

export type QueryStringStringifyOptions = {
  /**
   * Starts the query string with `?`.
   */
  addQueryPrefix?: boolean;
  /**
   * Writes arrays as `a[0]=b&a[1]=c` (`indices`, the default), `a[]=b&a[]=c`
   * (`brackets`) or `a=b&a=c` (`repeat`).
   */
  arrayFormat?: 'indices' | 'brackets' | 'repeat';
};

export type QueryStringParseOptions = {
  /**
   * Ignores a leading `?`.
   */
  ignoreQueryPrefix?: boolean;
  /**
   * The largest index read into an array. Larger indices stay object keys.
   * Defaults to 99, so arrays keep up to 100 items (`qs` defaults to 20).
   */
  arrayLimit?: number;
};

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

function warnUnsupported(
  method: 'parse' | 'stringify',
  supported: boolean,
  feature: string
) {
  warning(
    supported,
    `\`qsModule.${method}\` doesn't support ${feature} of \`qs\`. To use it, import \`qs\` in your \`createURL\` and \`parseURL\` functions: \`import qs from 'qs'\`.`
  );
}

/**
 * Writes the same query string as `qs.stringify(value, options)`: nested keys
 * in brackets, `null` as an empty value, and no `undefined` values or empty
 * arrays and objects.
 */
export function stringifyQueryString(
  value: unknown,
  options: QueryStringStringifyOptions = {}
): string {
  const { addQueryPrefix = false, arrayFormat = 'indices' } = options;

  if (__DEV__) {
    Object.keys(options).forEach((option) => {
      warnUnsupported(
        'stringify',
        option === 'addQueryPrefix' || option === 'arrayFormat',
        `the \`${option}\` option`
      );
    });
    warnUnsupported(
      'stringify',
      ['indices', 'brackets', 'repeat'].indexOf(arrayFormat) !== -1,
      `\`arrayFormat: '${arrayFormat}'\``
    );
  }

  const parameters: string[] = [];

  const add = (current: unknown, key: string) => {
    const item = current instanceof Date ? current.toISOString() : current;

    if (
      item !== null &&
      (typeof item === 'object' || typeof item === 'function')
    ) {
      Object.keys(item).forEach((childKey) => {
        let childPath = `${key}[${childKey}]`;
        if (Array.isArray(item) && arrayFormat === 'brackets') {
          childPath = `${key}[]`;
        } else if (Array.isArray(item) && arrayFormat === 'repeat') {
          childPath = key;
        }
        add((item as QueryObject)[childKey], childPath);
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

  const queryString = parameters.join('&');

  return addQueryPrefix && queryString ? `?${queryString}` : queryString;
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

function nest(segments: string[], value: unknown, arrayLimit: number): unknown {
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
      index <= arrayLimit
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

function compact(value: unknown, arrayLimit: number): unknown {
  if (Array.isArray(value)) {
    const items: unknown[] = [];
    value.forEach((item: unknown) => {
      items.push(compact(item, arrayLimit));
    });
    return items.length > arrayLimit + 1 ? { ...items } : items;
  }

  if (isContainer(value)) {
    Object.keys(value).forEach((key) => {
      value[key] = compact(value[key], arrayLimit);
    });
  }

  return value;
}

/**
 * Reads a query string like `qs.parse(search, options)`, with the same limits
 * on untrusted input: at most 1000 parameters, 5 levels of nesting and
 * `arrayLimit + 1` items per array, and no `Object.prototype` keys.
 */
export function parseQueryString(
  search: string,
  options: QueryStringParseOptions = {}
): ParsedQueryString {
  const { ignoreQueryPrefix = false, arrayLimit = DEFAULT_ARRAY_LIMIT } =
    options;

  if (__DEV__) {
    Object.keys(options).forEach((option) => {
      warnUnsupported(
        'parse',
        option === 'ignoreQueryPrefix' || option === 'arrayLimit',
        `the \`${option}\` option`
      );
    });
  }

  const values: QueryObject = Object.create(null);

  (ignoreQueryPrefix ? search.replace(/^\?/, '') : search)
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
      result = merge(result, nest(segments, values[key], arrayLimit));
    }
  });

  return compact(result, arrayLimit) as ParsedQueryString;
}

/**
 * Passed as `qsModule` to the `createURL` and `parseURL` functions of the
 * history router.
 */
export const queryStringModule = {
  parse: parseQueryString,
  stringify: stringifyQueryString,
};
