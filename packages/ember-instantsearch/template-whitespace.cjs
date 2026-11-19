/**
 * A template transform that drops the whitespace that only formats a template.
 *
 * The other flavors render no text between elements,
 * and `instantsearch.css` relies on that for inline elements.
 * Whitespace with a line break is formatting.
 * So is whitespace at the start of a line: the parser leaves the
 * indentation of a line that holds only a block, like `{{#if}}`.
 * Whitespace inside a line, as in `{{a}} {{b}}`, stays.
 */
module.exports = function stripFormattingWhitespace() {
  return {
    name: 'ember-instantsearch-strip-formatting-whitespace',
    visitor: {
      TextNode(node, path) {
        /**
         * Only content counts. Text in an attribute value stays as written.
         */
        if (path.parentKey !== 'children' && path.parentKey !== 'body') {
          return undefined;
        }

        if (!/^\s*$/.test(node.chars)) return undefined;

        if (node.chars.includes('\n') || node.loc.start.column === 0) {
          return null;
        }

        return undefined;
      },
    },
  };
};
