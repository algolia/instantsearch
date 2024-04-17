// This file was taken from the Next.js repo : https://github.com/vercel/next.js/blob/754fadacf30c145009506662bfbd2a4ccebb377d/packages/next/src/server/htmlescape.ts
// License: https://github.com/vercel/next.js/blob/754fadacf30c145009506662bfbd2a4ccebb377d/license.md

// This utility is based on https://github.com/zertosh/htmlescape
// License: https://github.com/zertosh/htmlescape/blob/0527ca7156a524d256101bb310a9f970f63078ad/LICENSE

const ESCAPE_LOOKUP: { [match: string]: string } = {
  '&': '\\u0026',
  '>': '\\u003e',
  '<': '\\u003c',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
};

export const ESCAPE_REGEX = /[&><\u2028\u2029]/g;

export function htmlEscapeJsonString(str: string): string {
  return str.replace(ESCAPE_REGEX, (match) => ESCAPE_LOOKUP[match]);
}
