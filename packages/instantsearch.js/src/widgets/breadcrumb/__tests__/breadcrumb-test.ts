/**
 * @jest-environment jsdom
 */

import breadcrumb from '../breadcrumb';

describe('breadcrumb()', () => {
  describe('Usage', () => {
    it('throws without `container`', () => {
      expect(() => {
        breadcrumb({
          // @ts-expect-error
          container: undefined,
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/breadcrumb/js/"
`);
    });
  });
});
