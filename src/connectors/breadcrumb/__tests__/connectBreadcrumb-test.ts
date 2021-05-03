import algoliasearchHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';
import { warning } from '../../../lib/utils';
import connectBreadcrumb from '../connectBreadcrumb';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';

describe('connectBreadcrumb', () => {
  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        // @ts-ignore
        connectBreadcrumb()({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (received type Undefined).

See documentation: https://www.algolia.com/doc/api-reference/widgets/breadcrumb/js/#connector"
`);
    });

    it('throws with undefined `attributes`', () => {
      expect(() => {
        connectBreadcrumb(() => {})({
          // @ts-ignore
          attributes: undefined,
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`attributes\` option expects an array of strings.

See documentation: https://www.algolia.com/doc/api-reference/widgets/breadcrumb/js/#connector"
`);
    });

    it('throws with empty `attributes`', () => {
      expect(() => {
        connectBreadcrumb(() => {})({
          attributes: [],
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`attributes\` option expects an array of strings.

See documentation: https://www.algolia.com/doc/api-reference/widgets/breadcrumb/js/#connector"
`);
    });
  });

  it('is a widget', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customBreadcrumb = connectBreadcrumb(render, unmount);
    const widget = customBreadcrumb({ attributes: ['category'] });

    expect(widget).toEqual(
      expect.objectContaining({
        $$type: 'ais.breadcrumb',
        init: expect.any(Function),
        render: expect.any(Function),
        dispose: expect.any(Function),
      })
    );
  });

  describe('getRenderState', () => {
    test('returns the render state', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createBreadcrumb = connectBreadcrumb(renderFn, unmountFn);
      const breadcrumb = createBreadcrumb({
        attributes: ['category', 'subCategory'],
      });
      const helper = algoliasearchHelper(
        createSearchClient(),
        'indexName',
        breadcrumb.getWidgetSearchParameters!(new SearchParameters(), {
          uiState: {},
        })
      );

      helper.toggleRefinement('category', 'Decoration');

      const renderState1 = breadcrumb.getRenderState(
        {
          breadcrumb: {
            anotherCategory: {
              canRefine: false,
              createURL: () => '',
              items: [],
              refine: () => {},
              widgetParams: { attributes: ['anotherCategory'] },
            },
          },
        },
        createInitOptions({ helper })
      );

      expect(renderState1.breadcrumb).toEqual({
        anotherCategory: {
          canRefine: false,
          createURL: expect.any(Function),
          items: [],
          refine: expect.any(Function),
          widgetParams: { attributes: ['anotherCategory'] },
        },
        category: {
          canRefine: false,
          createURL: expect.any(Function),
          items: [],
          refine: expect.any(Function),
          widgetParams: { attributes: ['category', 'subCategory'] },
        },
      });

      breadcrumb.init!(createInitOptions({ helper }));

      const renderState2 = breadcrumb.getRenderState(
        {
          breadcrumb: {
            anotherCategory: {
              canRefine: false,
              createURL: () => '',
              items: [],
              refine: () => {},
              widgetParams: { attributes: ['anotherCategory'] },
            },
          },
        },
        createRenderOptions({
          helper,
          state: helper.state,
          results: new SearchResults(helper.state, [
            createSingleSearchResponse({
              hits: [],
              facets: {
                category: {
                  Decoration: 880,
                },
                subCategory: {
                  'Decoration > Candle holders & candles': 193,
                  'Decoration > Frames & pictures': 173,
                },
              },
            }),
            createSingleSearchResponse({
              facets: {
                category: {
                  Decoration: 880,
                  Outdoor: 47,
                },
              },
            }),
          ]),
        })
      );

      expect(renderState2.breadcrumb).toEqual({
        anotherCategory: {
          canRefine: false,
          createURL: expect.any(Function),
          items: [],
          refine: expect.any(Function),
          widgetParams: { attributes: ['anotherCategory'] },
        },
        category: {
          canRefine: true,
          createURL: expect.any(Function),
          items: [{ label: 'Decoration', value: null }],
          refine: expect.any(Function),
          widgetParams: { attributes: ['category', 'subCategory'] },
        },
      });
    });
  });

  describe('getWidgetRenderState', () => {
    test('returns the widget render state', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createBreadcrumb = connectBreadcrumb(renderFn, unmountFn);
      const breadcrumb = createBreadcrumb({
        attributes: ['category', 'subCategory'],
      });
      const helper = algoliasearchHelper(
        createSearchClient(),
        'indexName',
        breadcrumb.getWidgetSearchParameters!(new SearchParameters(), {
          uiState: {},
        })
      );

      helper.toggleRefinement('category', 'Decoration');

      const renderState1 = breadcrumb.getWidgetRenderState(
        createInitOptions({ helper })
      );

      expect(renderState1).toEqual({
        canRefine: false,
        createURL: expect.any(Function),
        items: [],
        refine: expect.any(Function),
        widgetParams: { attributes: ['category', 'subCategory'] },
      });

      breadcrumb.init!(createInitOptions({ helper }));

      const renderState2 = breadcrumb.getWidgetRenderState(
        createRenderOptions({
          helper,
          state: helper.state,
          results: new SearchResults(helper.state, [
            createSingleSearchResponse({
              hits: [],
              facets: {
                category: {
                  Decoration: 880,
                },
                subCategory: {
                  'Decoration > Candle holders & candles': 193,
                  'Decoration > Frames & pictures': 173,
                },
              },
            }),
            createSingleSearchResponse({
              facets: {
                category: {
                  Decoration: 880,
                  Outdoor: 47,
                },
              },
            }),
          ]),
        })
      );

      expect(renderState2).toEqual({
        canRefine: true,
        createURL: expect.any(Function),
        items: [{ label: 'Decoration', value: null }],
        refine: expect.any(Function),
        widgetParams: { attributes: ['category', 'subCategory'] },
      });
    });
  });

  describe('getWidgetSearchParameters', () => {
    beforeEach(() => {
      warning.cache = {};
    });

    it('returns the `SearchParameters` with default value', () => {
      const render = () => {};
      const makeWidget = connectBreadcrumb(render);
      const helper = algoliasearchHelper(createSearchClient(), '');
      const widget = makeWidget({
        attributes: ['category', 'sub_category'],
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {},
      });

      expect(actual.hierarchicalFacets).toEqual([
        {
          name: 'category',
          attributes: ['category', 'sub_category'],
          rootPath: null,
          separator: ' > ',
        },
      ]);
    });

    it('returns the `SearchParameters` with default a custom `separator`', () => {
      const render = () => {};
      const makeWidget = connectBreadcrumb(render);
      const helper = algoliasearchHelper(createSearchClient(), '');
      const widget = makeWidget({
        attributes: ['category', 'sub_category'],
        separator: ' / ',
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {},
      });

      expect(actual.hierarchicalFacets).toEqual([
        {
          name: 'category',
          attributes: ['category', 'sub_category'],
          rootPath: null,
          separator: ' / ',
        },
      ]);
    });

    it('returns the `SearchParameters` with default a custom `rootPath`', () => {
      const render = () => {};
      const makeWidget = connectBreadcrumb(render);
      const helper = algoliasearchHelper(createSearchClient(), '');
      const widget = makeWidget({
        attributes: ['category', 'sub_category'],
        rootPath: 'TopLevel > SubLevel',
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {},
      });

      expect(actual.hierarchicalFacets).toEqual([
        {
          name: 'category',
          attributes: ['category', 'sub_category'],
          rootPath: 'TopLevel > SubLevel',
          separator: ' > ',
        },
      ]);
    });

    it('returns the `SearchParameters` with another `hierarchicalFacets` already defined', () => {
      const render = () => {};
      const makeWidget = connectBreadcrumb(render);
      const helper = algoliasearchHelper(createSearchClient(), '', {
        hierarchicalFacets: [
          {
            name: 'country',
            attributes: ['country', 'sub_country'],
            separator: ' > ',
          },
        ],
      });

      const widget = makeWidget({
        attributes: ['category', 'sub_category'],
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {},
      });

      expect(actual.hierarchicalFacets).toEqual([
        {
          name: 'country',
          attributes: ['country', 'sub_country'],
          separator: ' > ',
        },
        {
          name: 'category',
          attributes: ['category', 'sub_category'],
          separator: ' > ',
          rootPath: null,
        },
      ]);
    });

    it('returns the `SearchParameters` with the same `hierarchicalFacets` already defined', () => {
      const render = () => {};
      const makeWidget = connectBreadcrumb(render);
      const helper = algoliasearchHelper(createSearchClient(), '', {
        hierarchicalFacets: [
          {
            name: 'category',
            attributes: ['category', 'sub_category'],
            separator: ' > ',
            // @TODO Add missing type to js helper
            // @ts-ignore
            rootPath: null,
          },
        ],
      });

      const widget = makeWidget({
        attributes: ['category', 'sub_category'],
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {},
      });

      expect(actual.hierarchicalFacets).toEqual([
        {
          name: 'category',
          attributes: ['category', 'sub_category'],
          separator: ' > ',
          rootPath: null,
        },
      ]);
    });

    it('warns with the same `hierarchicalFacets` already defined with different `attributes`', () => {
      const render = () => {};
      const makeWidget = connectBreadcrumb(render);
      const helper = algoliasearchHelper(createSearchClient(), '', {
        hierarchicalFacets: [
          {
            name: 'category',
            attributes: ['category', 'sub_category', 'sub_sub_category'],
            separator: ' > ',
            // @ts-ignore
            rootPath: null,
          },
        ],
      });

      const widget = makeWidget({
        attributes: ['category', 'sub_category'],
      });

      expect(() =>
        widget.getWidgetSearchParameters!(helper.state, {
          uiState: {},
        })
      ).toWarnDev();
    });

    it('warns with the same `hierarchicalFacets` already defined with different `separator`', () => {
      const render = () => {};
      const makeWidget = connectBreadcrumb(render);
      const helper = algoliasearchHelper(createSearchClient(), '', {
        hierarchicalFacets: [
          {
            name: 'category',
            attributes: ['category', 'sub_category'],
            separator: ' > ',
            // @ts-ignore
            rootPath: null,
          },
        ],
      });

      const widget = makeWidget({
        attributes: ['category', 'sub_category'],
        separator: ' / ',
      });

      expect(() =>
        widget.getWidgetSearchParameters!(helper.state, {
          uiState: {},
        })
      ).toWarnDev();
    });

    it('warns with the same `hierarchicalFacets` already defined with different `rootPath`', () => {
      const render = () => {};
      const makeWidget = connectBreadcrumb(render);
      const helper = algoliasearchHelper(createSearchClient(), '', {
        hierarchicalFacets: [
          {
            name: 'category',
            attributes: ['category', 'sub_category'],
            separator: ' > ',
            // @ts-ignore
            rootPath: 'TopLevel > SubLevel',
          },
        ],
      });

      const widget = makeWidget({
        attributes: ['category', 'sub_category'],
        rootPath: 'TopLevel',
      });

      expect(() =>
        widget.getWidgetSearchParameters!(helper.state, {
          uiState: {},
        })
      ).toWarnDev();
    });
  });

  it('Renders during init and render', () => {
    const rendering = jest.fn();
    const makeWidget = connectBreadcrumb(rendering);
    const widget = makeWidget({ attributes: ['category', 'sub_category'] });

    const config = widget.getWidgetSearchParameters!(new SearchParameters({}), {
      uiState: {},
    });
    expect(config).toEqual(
      new SearchParameters({
        hierarchicalFacets: [
          {
            attributes: ['category', 'sub_category'],
            name: 'category',
            // @ts-ignore
            rootPath: null,
            separator: ' > ',
          },
        ],
      })
    );

    // Verify that the widget has not been rendered yet at this point
    expect(rendering.mock.calls).toHaveLength(0);

    const helper = algoliasearchHelper(createSearchClient(), '', config);
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: () => '#',
      })
    );

    // Verify that rendering has been called upon init with isFirstRendering = true
    expect(rendering.mock.calls).toHaveLength(1);
    expect(rendering.mock.calls[0][0].widgetParams).toEqual({
      attributes: ['category', 'sub_category'],
    });
    expect(rendering.mock.calls[0][1]).toBe(true);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            facets: {
              category: {
                Decoration: 880,
              },
              subCategory: {
                'Decoration > Candle holders & candles': 193,
                'Decoration > Frames & pictures': 173,
              },
            },
          }),
          createSingleSearchResponse({
            facets: {
              category: {
                Decoration: 880,
                Outdoor: 47,
              },
            },
          }),
        ]),
        state: helper.state,
        helper,
      })
    );

    // Verify that rendering has been called upon render with isFirstRendering = false
    expect(rendering.mock.calls).toHaveLength(2);
    expect(rendering.mock.calls[1][0].widgetParams).toEqual({
      attributes: ['category', 'sub_category'],
    });
    expect(rendering.mock.calls[1][1]).toBe(false);
  });

  it('provides the correct facet values', () => {
    const rendering = jest.fn();
    const makeWidget = connectBreadcrumb(rendering);
    const widget = makeWidget({ attributes: ['category', 'sub_category'] });

    const config = widget.getWidgetSearchParameters!(new SearchParameters(), {
      uiState: {},
    });
    const helper = algoliasearchHelper(createSearchClient(), '', config);
    helper.search = jest.fn();

    helper.toggleRefinement('category', 'Decoration');

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.items).toEqual([]);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            facets: {
              category: {
                Decoration: 880,
              },
              subCategory: {
                'Decoration > Candle holders & candles': 193,
                'Decoration > Frames & pictures': 173,
              },
            },
          }),
          createSingleSearchResponse({
            facets: {
              category: {
                Decoration: 880,
                Outdoor: 47,
              },
            },
          }),
        ]),
        state: helper.state,
        helper,
      })
    );

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.items).toEqual([
      { label: 'Decoration', value: null },
    ]);
  });

  it('provides items from an empty results', () => {
    const rendering = jest.fn();
    const makeWidget = connectBreadcrumb(rendering);
    const widget = makeWidget({
      attributes: ['category', 'sub_category'],
    });

    const config = widget.getWidgetSearchParameters!(new SearchParameters({}), {
      uiState: {},
    });
    const helper = algoliasearchHelper(createSearchClient(), '', config);

    helper.search = jest.fn();

    helper.toggleRefinement('category', 'Decoration');

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.items).toEqual([]);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            facets: {},
          }),
          createSingleSearchResponse({
            hits: [],
            facets: {},
          }),
        ]),
        state: helper.state,
        helper,
      })
    );

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.items).toEqual([]);
  });

  it('provides the correct facet values when transformed', () => {
    const rendering = jest.fn();
    const makeWidget = connectBreadcrumb(rendering);
    const widget = makeWidget({
      attributes: ['category', 'sub_category'],
      transformItems: items =>
        items.map(item => ({ ...item, label: 'transformed' })),
    });

    const config = widget.getWidgetSearchParameters!(new SearchParameters(), {
      uiState: {},
    });
    const helper = algoliasearchHelper(createSearchClient(), '', config);
    helper.search = jest.fn();

    helper.toggleRefinement('category', 'Decoration');

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.items).toEqual([]);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            facets: {
              category: {
                Decoration: 880,
              },
              subCategory: {
                'Decoration > Candle holders & candles': 193,
                'Decoration > Frames & pictures': 173,
              },
            },
          }),
          createSingleSearchResponse({
            facets: {
              category: {
                Decoration: 880,
                Outdoor: 47,
              },
            },
          }),
        ]),
        state: helper.state,
        helper,
      })
    );

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.items).toEqual([
      expect.objectContaining({ label: 'transformed' }),
    ]);
  });

  it('returns the correct URL', () => {
    const rendering = jest.fn();
    const makeWidget = connectBreadcrumb(rendering);
    const widget = makeWidget({ attributes: ['category', 'sub_category'] });

    const config = widget.getWidgetSearchParameters!(new SearchParameters(), {
      uiState: {},
    });
    const helper = algoliasearchHelper(createSearchClient(), '', config);
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: state => JSON.stringify(state),
      })
    );

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.items).toEqual([]);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            facets: {
              category: {
                Decoration: 880,
              },
              subCategory: {
                'Decoration > Candle holders & candles': 193,
                'Decoration > Frames & pictures': 173,
              },
            },
          }),
          createSingleSearchResponse({
            facets: {
              category: {
                Decoration: 880,
                Outdoor: 47,
              },
            },
          }),
        ]),
        state: helper.state,
        helper,
        createURL: state => JSON.stringify(state),
      })
    );
    const createURL = rendering.mock.calls[1][0].createURL;
    expect(helper.state.hierarchicalFacetsRefinements).toEqual({});
    const stateForURL = JSON.parse(
      createURL('Decoration > Candle holders & candles')
    );
    expect(stateForURL.hierarchicalFacetsRefinements).toEqual({
      category: ['Decoration > Candle holders & candles'],
    });
  });

  it('returns the correct URL version with 3 levels', () => {
    const rendering = jest.fn();
    const makeWidget = connectBreadcrumb(rendering);
    const widget = makeWidget({
      attributes: [
        'hierarchicalCategories.lvl0',
        'hierarchicalCategories.lvl1',
        'hierarchicalCategories.lvl2',
      ],
    });

    const config = widget.getWidgetSearchParameters!(new SearchParameters(), {
      uiState: {},
    });
    const helper = algoliasearchHelper(createSearchClient(), '', config);
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: state => JSON.stringify(state),
      })
    );

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.items).toEqual([]);

    helper.toggleFacetRefinement(
      'hierarchicalCategories.lvl0',
      'Cameras & Camcorders > Digital Cameras > Digital SLR Cameras'
    );
    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            page: 0,
            nbPages: 57,
            index: 'instant_search',
            processingTimeMS: 1,
            nbHits: 170,
            query: '',
            hitsPerPage: 3,
            params:
              'query=&hitsPerPage=3&page=0&facets=%5B%22hierarchicalCategories.lvl0%22%2C%22hierarchicalCategories.lvl1%22%2C%22hierarchicalCategories.lvl2%22%5D&tagFilters=&facetFilters=%5B%5B%22hierarchicalCategories.lvl1%3ACameras%20%26%20Camcorders%20%3E%20Digital%20Cameras%22%5D%5D',
            exhaustiveFacetsCount: true,
            exhaustiveNbHits: true,
            facets: {
              'hierarchicalCategories.lvl1': {
                'Cameras & Camcorders > Digital Cameras': 170,
              },
              'hierarchicalCategories.lvl2': {
                'Cameras & Camcorders > Digital Cameras > Digital SLR Cameras': 44,
                'Cameras & Camcorders > Digital Cameras > Mirrorless Cameras': 29,
                'Cameras & Camcorders > Digital Cameras > Point & Shoot Cameras': 84,
              },
              'hierarchicalCategories.lvl0': {
                'Cameras & Camcorders': 170,
              },
            },
          }),
          createSingleSearchResponse({
            exhaustiveFacetsCount: true,
            params:
              'query=&hitsPerPage=1&page=0&attributesToRetrieve=%5B%5D&attributesToHighlight=%5B%5D&attributesToSnippet=%5B%5D&tagFilters=&facets=%5B%22hierarchicalCategories.lvl0%22%2C%22hierarchicalCategories.lvl1%22%5D&facetFilters=%5B%5B%22hierarchicalCategories.lvl0%3ACameras%20%26%20Camcorders%22%5D%5D',
            facets: {
              'hierarchicalCategories.lvl0': {
                'Cameras & Camcorders': 1369,
              },
              'hierarchicalCategories.lvl1': {
                'Cameras & Camcorders > Camcorders': 50,
                'Cameras & Camcorders > Memory Cards': 113,
                'Cameras & Camcorders > Trail Cameras': 5,
                'Cameras & Camcorders > Microscopes': 5,
                'Cameras & Camcorders > Spotting Scopes': 5,
                'Cameras & Camcorders > Telescopes': 15,
                'Cameras & Camcorders > Monoculars': 5,
                'Cameras & Camcorders > Digital Cameras': 170,
                'Cameras & Camcorders > P&S Adapters & Chargers': 1,
                'Cameras & Camcorders > Binoculars': 20,
                'Cameras & Camcorders > Camcorder Accessories': 173,
                'Cameras & Camcorders > Digital Camera Accessories': 804,
              },
            },
            exhaustiveNbHits: true,
            hitsPerPage: 1,
            index: 'instant_search',
            processingTimeMS: 1,
            nbPages: 1000,
            nbHits: 1369,
            query: '',
            page: 0,
            hits: [],
          }),
          createSingleSearchResponse({
            params:
              'query=&hitsPerPage=1&page=0&attributesToRetrieve=%5B%5D&attributesToHighlight=%5B%5D&attributesToSnippet=%5B%5D&tagFilters=&facets=%5B%22hierarchicalCategories.lvl0%22%5D',
            exhaustiveFacetsCount: true,
            exhaustiveNbHits: true,
            facets: {
              'hierarchicalCategories.lvl0': {
                Audio: 1570,
                'Computers & Tablets': 3563,
                'Movies & Music': 18,
                Paper: 65,
                'MP Pending': 3,
                'Cameras & Camcorders': 1369,
                'Cell Phones': 3291,
                Appliances: 4306,
                'Custom Parts': 2,
                'Health, Fitness & Beauty': 923,
                'Video Games': 505,
                'Office & School Supplies': 617,
                'Entertainment Gift Cards': 46,
                'Musical Instruments': 312,
                'MP Exclusives': 1,
                'Toys, Games & Drones': 285,
                'Name Brands': 101,
                'Batteries & Power': 7,
                'Star Wars': 1,
                'Geek Squad': 2,
                'DC Comics': 1,
                'Scanners, Faxes & Copiers': 46,
                'Furniture & Decor': 91,
                'Household Essentials': 148,
                'Car Electronics & GPS': 1208,
                'Magnolia Home Theater': 33,
                Housewares: 255,
                'Smart Home': 405,
                'Beverage & Wine Coolers': 1,
                'TV & Home Theater': 1201,
                'Avengers: Age of Ultron': 1,
                Exclusives: 1,
                'Gift Ideas': 2,
                'Carfi Instore Only': 4,
                'Office Electronics': 328,
                'Office Furniture & Storage': 152,
                'Wearable Technology': 271,
                'In-Store Only': 2,
                'Telephones & Communication': 194,
              },
            },
            hitsPerPage: 1,
            nbPages: 1000,
            processingTimeMS: 1,
            index: 'instant_search',
            query: '',
            nbHits: 21469,
            hits: [],
            page: 0,
          }),
        ]),
        state: helper.state,
        helper,
        createURL: state => JSON.stringify(state),
      })
    );
    const { createURL, items } = rendering.mock.calls[1][0];
    const secondItemValue = items[1].value;

    const stateForURL = JSON.parse(createURL(secondItemValue));

    expect(stateForURL.hierarchicalFacetsRefinements).toEqual({
      'hierarchicalCategories.lvl0': ['Cameras & Camcorders > Digital Cameras'],
    });
    const stateForHome = JSON.parse(createURL(null));
    expect(stateForHome.hierarchicalFacetsRefinements).toEqual({
      'hierarchicalCategories.lvl0': [],
    });
  });

  it('toggles the refine function when passed the special value null', () => {
    const rendering = jest.fn();
    const makeWidget = connectBreadcrumb(rendering);
    const widget = makeWidget({ attributes: ['category', 'sub_category'] });

    const config = widget.getWidgetSearchParameters!(new SearchParameters(), {
      uiState: {},
    });
    const helper = algoliasearchHelper(createSearchClient(), '', config);
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.items).toEqual([]);

    helper.toggleRefinement('category', 'Decoration');

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            facets: {
              category: {
                Decoration: 880,
              },
              subCategory: {
                'Decoration > Candle holders & candles': 193,
                'Decoration > Frames & pictures': 173,
              },
            },
          }),
          createSingleSearchResponse({
            facets: {
              category: {
                Decoration: 880,
                Outdoor: 47,
              },
            },
          }),
        ]),
        state: helper.state,
        helper,
      })
    );
    const refine = rendering.mock.calls[1][0].refine;
    expect(helper.getHierarchicalFacetBreadcrumb('category')).toEqual([
      'Decoration',
    ]);
    refine(null);
    expect(helper.getHierarchicalFacetBreadcrumb('category')).toEqual([]);
  });

  describe('dispose', () => {
    it('does not throw without the unmount function', () => {
      const helper = algoliasearchHelper(createSearchClient(), '');

      const renderFn = () => {};
      const makeWidget = connectBreadcrumb(renderFn);
      const widget = makeWidget({ attributes: ['category'] });

      expect(() =>
        widget.dispose!(createDisposeOptions({ helper, state: helper.state }))
      ).not.toThrow();
    });

    it('does not remove refinement', () => {
      const renderFn = () => {};
      const makeWidget = connectBreadcrumb(renderFn);
      const widget = makeWidget({ attributes: ['category'] });

      const helper = algoliasearchHelper(createSearchClient(), '', {
        hierarchicalFacetsRefinements: {
          category: ['boxes'],
        },
      });
      helper.search = jest.fn();

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
        })
      );

      const newState = widget.dispose!(
        createDisposeOptions({ helper, state: helper.state })
      );

      expect(newState).toBeUndefined();
    });
  });
});
