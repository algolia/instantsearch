import instantsearch from '..';

describe('instantsearch()', () => {
  it('includes a version', () => {
    expect(instantsearch.version).toMatch(
      /^(\d+\.)?(\d+\.)?(\*|\d+)(-beta.\d+)?$/
    );
  });

  it('includes the widget functions', () => {
    Object.values(instantsearch.widgets).forEach((widget) => {
      expect(widget).toBeInstanceOf(Function);
    });
  });

  it('includes the connectors functions', () => {
    Object.values(instantsearch.connectors).forEach((connector) => {
      expect(connector).toBeInstanceOf(Function);
    });
  });

  it('includes the API and the helper functions', () => {
    expect(Object.keys(instantsearch)).toMatchInlineSnapshot(`
      [
        "version",
        "connectors",
        "widgets",
        "middlewares",
        "routers",
        "stateMappings",
        "templates",
        "createInfiniteHitsSessionStorageCache",
        "highlight",
        "reverseHighlight",
        "snippet",
        "reverseSnippet",
        "insights",
      ]
    `);
  });
});
