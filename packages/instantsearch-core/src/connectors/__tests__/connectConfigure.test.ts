/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import algoliasearchHelper, { SearchParameters } from 'algoliasearch-helper';
import {
  createInitOptions,
  createRenderOptions,
} from 'instantsearch-core/test/createWidget';

import { connectConfigure, instantsearch, noop } from '../..';

import type { AlgoliaSearchHelper } from 'algoliasearch-helper';

describe('connectConfigure', () => {
  let helper: AlgoliaSearchHelper;

  beforeEach(() => {
    helper = algoliasearchHelper(createSearchClient(), '', {});
  });

  describe('Usage', () => {
    it('throws without searchParameters', () => {
      // @ts-expect-error wrong options
      expect(() => connectConfigure()()).toThrowErrorMatchingInlineSnapshot(`
"The \`searchParameters\` option expects an object.

See documentation: https://www.algolia.com/doc/api-reference/widgets/configure/js/#connector"
`);
    });

    it('throws when you pass it a non-plain object', () => {
      expect(() => {
        // @ts-expect-error wrong options
        connectConfigure()(new Date());
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`searchParameters\` option expects an object.

See documentation: https://www.algolia.com/doc/api-reference/widgets/configure/js/#connector"
`);

      expect(() => {
        // @ts-expect-error wrong options
        connectConfigure()(() => {});
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`searchParameters\` option expects an object.

See documentation: https://www.algolia.com/doc/api-reference/widgets/configure/js/#connector"
`);
    });

    it('does not throw with a render function but without an unmount function', () => {
      expect(() => connectConfigure(jest.fn(), undefined)).not.toThrow();
    });

    it('with a unmount function but no render function does not throw', () => {
      // @ts-expect-error wrong options
      expect(() => connectConfigure(undefined, jest.fn())).not.toThrow();
    });

    it('does not throw without render and unmount functions', () => {
      // @ts-expect-error wrong options
      expect(() => connectConfigure(undefined, undefined)).not.toThrow();
    });
  });

  it('is a widget', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customConfigure = connectConfigure(render, unmount);
    const widget = customConfigure({ searchParameters: {} });

    expect(widget).toEqual(
      expect.objectContaining({
        $$type: 'ais.configure',
        init: expect.any(Function),
        render: expect.any(Function),
        dispose: expect.any(Function),
      })
    );
  });

  it('should apply searchParameters', () => {
    const makeWidget = connectConfigure(noop);
    const widget = makeWidget({
      searchParameters: {
        analytics: true,
      },
    });

    expect(
      widget.getWidgetSearchParameters!(new SearchParameters({}), {
        uiState: {},
      })
    ).toEqual(
      new SearchParameters({
        analytics: true,
      })
    );
  });

  it('should apply searchParameters with a higher priority', () => {
    const makeWidget = connectConfigure(noop);
    const widget = makeWidget({
      searchParameters: {
        analytics: true,
      },
    });

    expect(
      widget.getWidgetSearchParameters!(
        new SearchParameters({
          analytics: false,
        }),
        { uiState: {} }
      )
    ).toEqual(
      new SearchParameters({
        analytics: true,
      })
    );

    expect(
      widget.getWidgetSearchParameters!(
        new SearchParameters({
          analytics: false,
          clickAnalytics: true,
        }),
        { uiState: {} }
      )
    ).toEqual(
      new SearchParameters({
        analytics: true,
        clickAnalytics: true,
      })
    );
  });

  it('should apply new searchParameters on refine()', async () => {
    const searchClient = createSearchClient();
    const search = instantsearch({
      searchClient,
      indexName: 'indexName',
    });
    search.start();
    const renderFn = jest.fn();
    const makeWidget = connectConfigure(renderFn, jest.fn());
    const widget = makeWidget({
      searchParameters: {
        analytics: true,
      },
    });

    search.addWidgets([widget]);

    search.helper!.setState(
      widget.getWidgetSearchParameters!(
        new SearchParameters({
          // This facet is added outside of the widget params
          // so it shouldn't be overridden when calling `refine`.
          facets: ['brand'],
        }),
        { uiState: {} }
      )
    );

    expect(
      widget.getWidgetSearchParameters!(new SearchParameters({}), {
        uiState: {},
      })
    ).toEqual(
      new SearchParameters({
        analytics: true,
      })
    );

    await wait(100);
    expect(searchClient.search).toHaveBeenCalledTimes(1);
    expect(searchClient.search).toHaveBeenLastCalledWith([
      {
        indexName: 'indexName',
        params: { analytics: true, facets: ['brand'] },
      },
    ]);

    const { refine } = renderFn.mock.calls[0][0];

    refine({ hitsPerPage: 3, facets: ['rating'] });

    expect(
      widget.getWidgetSearchParameters!(new SearchParameters({}), {
        uiState: {},
      })
    ).toEqual(
      new SearchParameters({
        hitsPerPage: 3,
        facets: ['rating'],
      })
    );
    await wait(100);
    expect(searchClient.search).toHaveBeenCalledTimes(2);
    expect(searchClient.search).toHaveBeenLastCalledWith([
      {
        indexName: 'indexName',
        params: {
          hitsPerPage: 3,
          analytics: true,
          facets: ['brand', 'rating'],
        },
      },
    ]);
  });

  it('should dispose only the state set by configure', async () => {
    const search = instantsearch({
      searchClient: createSearchClient(),
      indexName: 'indexName',
    });
    search.start();

    const analytics = connectConfigure(noop)({
      searchParameters: { analytics: true },
    });
    const clickAnalytics = connectConfigure(noop)({
      searchParameters: { clickAnalytics: true },
    });

    search.addWidgets([analytics]);

    await wait(100);
    expect(search.client.search).toHaveBeenCalledWith([
      { indexName: 'indexName', params: { analytics: true } },
    ]);

    search.addWidgets([clickAnalytics]);

    await wait(100);
    expect(search.client.search).toHaveBeenCalledWith([
      {
        indexName: 'indexName',
        params: { analytics: true, clickAnalytics: true },
      },
    ]);

    search.removeWidgets([analytics]);

    await wait(100);
    expect(search.client.search).toHaveBeenCalledWith([
      { indexName: 'indexName', params: { clickAnalytics: true } },
    ]);
  });

  describe('getRenderState', () => {
    test('returns the render state', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createConfigure = connectConfigure(renderFn, unmountFn);
      const configure = createConfigure({
        searchParameters: {
          facetFilters: ['brand:Samsung'],
        },
      });

      const renderState1 = configure.getRenderState({}, createInitOptions());

      expect(renderState1.configure).toEqual({
        refine: expect.any(Function),
        widgetParams: {
          searchParameters: {
            facetFilters: ['brand:Samsung'],
          },
        },
      });

      configure.init!(createInitOptions());

      const renderState2 = configure.getRenderState({}, createRenderOptions());

      expect(renderState2.configure).toEqual({
        refine: expect.any(Function),
        widgetParams: {
          searchParameters: { facetFilters: ['brand:Samsung'] },
        },
      });
    });

    test('merges the render state', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createConfigure = connectConfigure(renderFn, unmountFn);
      const configure = createConfigure({
        searchParameters: {
          facetFilters: ['brand:Samsung'],
        },
      });

      const renderState1 = configure.getRenderState(
        {
          configure: {
            refine() {},
            widgetParams: {
              searchParameters: { removeStopWords: ['en'] },
            },
          },
        },
        createInitOptions()
      );

      expect(renderState1.configure).toEqual({
        refine: expect.any(Function),
        widgetParams: {
          searchParameters: {
            removeStopWords: ['en'],
            facetFilters: ['brand:Samsung'],
          },
        },
      });

      configure.init!(createInitOptions());

      const renderState2 = configure.getRenderState(
        {
          configure: {
            refine() {},
            widgetParams: {
              searchParameters: { queryType: 'prefixAll' },
            },
          },
        },
        createRenderOptions()
      );

      expect(renderState2.configure).toEqual({
        refine: expect.any(Function),
        widgetParams: {
          searchParameters: {
            queryType: 'prefixAll',
            facetFilters: ['brand:Samsung'],
          },
        },
      });
    });
  });

  describe('getWidgetRenderState', () => {
    test('returns the widget render state', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createConfigure = connectConfigure(renderFn, unmountFn);
      const configure = createConfigure({
        searchParameters: { facetFilters: ['brand:Samsung'] },
      });

      const renderState1 = configure.getWidgetRenderState(createInitOptions());

      expect(renderState1).toEqual({
        refine: expect.any(Function),
        widgetParams: {
          searchParameters: { facetFilters: ['brand:Samsung'] },
        },
      });

      configure.init!(createInitOptions());

      const renderState2 = configure.getWidgetRenderState(
        createRenderOptions()
      );

      expect(renderState2).toEqual({
        refine: expect.any(Function),
        widgetParams: {
          searchParameters: { facetFilters: ['brand:Samsung'] },
        },
      });
    });
  });

  describe('getWidgetSearchParameters', () => {
    it('returns parameters set by default', () => {
      const makeWidget = connectConfigure(noop);
      const widget = makeWidget({
        searchParameters: {
          analytics: true,
        },
      });

      const sp = widget.getWidgetSearchParameters!(new SearchParameters(), {
        uiState: {},
      });

      expect(sp).toEqual(new SearchParameters({ analytics: true }));
    });

    it('merges with the previous parameters', () => {
      const makeWidget = connectConfigure(noop);
      const widget = makeWidget({
        searchParameters: {
          disjunctiveFacets: ['brand'],
          disjunctiveFacetsRefinements: {
            brand: ['Apple'],
          },
        },
      });

      const sp = widget.getWidgetSearchParameters!(
        new SearchParameters({
          disjunctiveFacets: ['categories'],
          disjunctiveFacetsRefinements: {
            categories: ['Phone'],
          },
        }),
        {
          uiState: {},
        }
      );

      expect(sp).toEqual(
        new SearchParameters({
          disjunctiveFacets: ['categories', 'brand'],
          disjunctiveFacetsRefinements: {
            brand: ['Apple'],
            categories: ['Phone'],
          },
        })
      );
    });

    it('stores refined state', () => {
      const renderFn = jest.fn();
      const makeWidget = connectConfigure(renderFn);
      const widget = makeWidget({
        searchParameters: {
          analyticsTags: ['best-website-in-the-world'],
        },
      });

      widget.init!(createInitOptions({ helper }));
      const { refine } = renderFn.mock.calls[0][0];

      refine({ analyticsTags: ['worst-site-now'] });

      const sp = widget.getWidgetSearchParameters!(new SearchParameters(), {
        uiState: {},
      });

      expect(sp).toEqual(
        new SearchParameters({
          analyticsTags: ['worst-site-now'],
        })
      );
    });
  });
});
