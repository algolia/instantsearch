import * as instantsearchModule from '../index.es';

const { instantsearch, version } = instantsearchModule;

describe('index.es', () => {
  it('exports instantsearch() and a version', () => {
    expect(typeof instantsearch).toBe('function');
    expect(version).toMatch(/^(\d+\.)?(\d+\.)?(\*|\d+)(-beta.\d+)?$/);
  });

  it('has no default export', () => {
    expect(instantsearchModule).not.toHaveProperty('default');
  });

  it('does not attach the namespaces to instantsearch()', () => {
    expect(Object.keys(instantsearch)).toEqual([]);
  });

  it('exports widgets, connectors, routers, state mappings and helpers by name', () => {
    expect(instantsearchModule).toEqual(
      expect.objectContaining({
        searchBox: expect.any(Function),
        index: expect.any(Function),
        carousel: expect.any(Function),
        connectSearchBox: expect.any(Function),
        createInsightsMiddleware: expect.any(Function),
        createInfiniteHitsSessionStorageCache: expect.any(Function),
        historyRouter: expect.any(Function),
        simpleStateMapping: expect.any(Function),
        singleIndexStateMapping: expect.any(Function),
        highlight: expect.any(Function),
        snippet: expect.any(Function),
        reverseHighlight: expect.any(Function),
        reverseSnippet: expect.any(Function),
      })
    );
  });

  it('does not export the short router and state mapping names', () => {
    expect(instantsearchModule).not.toHaveProperty('history');
    expect(instantsearchModule).not.toHaveProperty('simple');
    expect(instantsearchModule).not.toHaveProperty('singleIndex');
  });
});
