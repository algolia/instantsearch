import * as instantsearchModule from '../index.es';

import type {
  HitsCSSClasses,
  HitsTemplates,
  HitsWidgetParams,
  SearchBoxCSSClasses,
  SearchBoxTemplates,
  SearchBoxWidgetParams,
  StatsTemplates,
  QueryRuleCustomDataTemplates,
} from '../index.es';

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
      })
    );
  });

  it('does not export the short router and state mapping names', () => {
    expect(instantsearchModule).not.toHaveProperty('history');
    expect(instantsearchModule).not.toHaveProperty('simple');
    expect(instantsearchModule).not.toHaveProperty('singleIndex');
  });

  it('does not export the deprecated HTML-string and legacy insights helpers', () => {
    [
      'highlight',
      'snippet',
      'reverseHighlight',
      'reverseSnippet',
      'insights',
    ].forEach((name) => {
      expect(instantsearchModule).not.toHaveProperty(name);
    });
  });

  it('exports the public widget types from the root', () => {
    // Type-only: this fails to compile when a widget type is not exported.
    const searchBox: SearchBoxWidgetParams = { container: '#search-box' };
    const searchBoxTemplates: SearchBoxTemplates = {};
    const searchBoxCSSClasses: SearchBoxCSSClasses = { root: 'root' };
    const hits: HitsWidgetParams = { container: '#hits' };
    const hitsTemplates: HitsTemplates = {};
    const hitsCSSClasses: HitsCSSClasses = { root: 'root' };
    const statsTemplates: StatsTemplates = {};
    const queryRuleCustomDataTemplates: QueryRuleCustomDataTemplates = {};

    expect([
      searchBox,
      searchBoxTemplates,
      searchBoxCSSClasses,
      hits,
      hitsTemplates,
      hitsCSSClasses,
      statsTemplates,
      queryRuleCustomDataTemplates,
    ]).toHaveLength(8);
  });

  it('does not leak the widgets internal defaultTemplates', () => {
    expect(instantsearchModule).not.toHaveProperty('defaultTemplates');
  });
});
