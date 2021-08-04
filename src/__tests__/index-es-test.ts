import instantsearch from '../index.es';

describe('instantsearch()', () => {
  it('includes a version', () => {
    expect(instantsearch.version).toMatch(
      /^(\d+\.)?(\d+\.)?(\*|\d+)(-beta.\d+)?$/
    );
  });

  it('does not include the widget functions', () => {
    // @ts-expect-error
    expect(() => instantsearch.widgets).toThrowErrorMatchingInlineSnapshot(`
      "\\"instantsearch.widgets\\" are not available from the ES build.

      To import the widgets:

      import { searchBox } from 'instantsearch.js/es/widgets'"
    `);
  });

  it('does not include the connectors functions', () => {
    // @ts-expect-error
    expect(() => instantsearch.connectors).toThrowErrorMatchingInlineSnapshot(`
      "\\"instantsearch.connectors\\" are not available from the ES build.

      To import the connectors:

      import { connectSearchBox } from 'instantsearch.js/es/connectors'"
    `);
  });

  it('includes the helper functions', () => {
    expect(Object.keys(instantsearch)).toMatchInlineSnapshot(`
      Array [
        "version",
        "createInfiniteHitsSessionStorageCache",
        "highlight",
        "reverseHighlight",
        "snippet",
        "reverseSnippet",
        "insights",
        "getInsightsAnonymousUserToken",
      ]
    `);
  });
});
