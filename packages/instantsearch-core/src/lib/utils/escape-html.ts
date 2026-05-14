/**
 * This implementation is taken from Lodash implementation.
 * See: https://github.com/lodash/lodash/blob/4.17.11-npm/escape.js
 */

// Used to map characters to HTML entities.
const htmlEntities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

// Used to match HTML entities and HTML characters.
const regexUnescapedHtml = /[&<>"']/g;
const regexHasUnescapedHtml = RegExp(regexUnescapedHtml.source);

/**
 * Converts the characters "&", "<", ">", '"', and "'" in `string` to their
 * corresponding HTML entities.
 */
export function escape(value: string): string {
  return value && regexHasUnescapedHtml.test(value)
    ? value.replace(
        regexUnescapedHtml,
        (character) => htmlEntities[character as keyof typeof htmlEntities]
      )
    : value;
}

/**
 * This implementation is taken from Lodash implementation.
 * See: https://github.com/lodash/lodash/blob/4.17.11-npm/unescape.js
 */

// Used to map HTML entities to characters.
const htmlCharacters = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

// Used to match HTML entities and HTML characters.
const regexEscapedHtml = /&(amp|quot|lt|gt|#39);/g;
const regexHasEscapedHtml = RegExp(regexEscapedHtml.source);

/**
 * Converts the HTML entities "&", "<", ">", '"', and "'" in `string` to their
 * characters.
 */
export function unescape(value: string): string {
  return value && regexHasEscapedHtml.test(value)
    ? value.replace(
        regexEscapedHtml,
        (character) => htmlCharacters[character as keyof typeof htmlCharacters]
      )
    : value;
}
