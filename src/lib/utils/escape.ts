/**
 * This implementation is taken from Lodash implementation.
 * See: https://github.com/lodash/lodash/blob/4.17.11-npm/escape.js
 */

// Used to map characters to HTML entities.
const htmlEscapes = {
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
function escape(value: string): string {
  return value && regexHasUnescapedHtml.test(value)
    ? value.replace(regexUnescapedHtml, character => htmlEscapes[character])
    : value;
}

export default escape;
