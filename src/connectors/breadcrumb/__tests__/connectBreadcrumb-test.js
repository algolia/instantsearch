import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;

import connectBreadcrumb from '../connectBreadcrumb.js';

describe('connectBreadcrumb', () => {
  it('It should compute getConfiguration() correctly', () => {
    const rendering = jest.fn();
    const makeWidget = connectBreadcrumb(rendering);

    const widget = makeWidget({ attributes: ['category', 'sub_category'] });

    // when there is no hierarchicalFacets into current configuration
    {
      const config = widget.getConfiguration({});
      expect(config).toEqual({
        hierarchicalFacets: [
          {
            attributes: ['category', 'sub_category'],
            name: 'category',
            rootPath: null,
            separator: ' > ',
          },
        ],
      });
    }

    // when there is an identical hierarchicalFacets into current configuration
    {
      const spy = jest.spyOn(global.console, 'warn');
      const config = widget.getConfiguration({
        hierarchicalFacets: [{ name: 'category' }],
      });
      expect(config).toEqual({});
      expect(spy).toHaveBeenCalled();
      spy.mockReset();
      spy.mockRestore();
    }

    // when there is already a different hierarchicalFacets into current configuration
    {
      const config = widget.getConfiguration({
        hierarchicalFacets: [{ name: 'foo' }],
      });
      expect(config).toEqual({
        hierarchicalFacets: [
          {
            attributes: ['category', 'sub_category'],
            name: 'category',
            rootPath: null,
            separator: ' > ',
          },
        ],
      });
    }
  });

  it('Renders during init and render', () => {
    const rendering = jest.fn();
    const makeWidget = connectBreadcrumb(rendering);
    const widget = makeWidget({ attributes: ['category', 'sub_category'] });

    const config = widget.getConfiguration({});
    expect(config).toEqual({
      hierarchicalFacets: [
        {
          attributes: ['category', 'sub_category'],
          name: 'category',
          rootPath: null,
          separator: ' > ',
        },
      ],
    });

    // Verify that the widget has not been rendered yet at this point
    expect(rendering.mock.calls).toHaveLength(0);

    const helper = jsHelper({}, '', config);
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    // Verify that rendering has been called upon init with isFirstRendering = true
    expect(rendering.mock.calls).toHaveLength(1);
    expect(rendering.mock.calls[0][0].widgetParams).toEqual({
      attributes: ['category', 'sub_category'],
    });
    expect(rendering.mock.calls[0][1]).toBe(true);

    const instantSearchInstance = { templatesConfig: undefined };
    widget.render({
      results: new SearchResults(helper.state, [
        {
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
        },
        {
          facets: {
            category: {
              Decoration: 880,
              Outdoor: 47,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
      instantSearchInstance,
    });

    // Verify that rendering has been called upon render with isFirstRendering = false
    expect(rendering.mock.calls).toHaveLength(2);
    expect(rendering.mock.calls[1][0].widgetParams).toEqual({
      attributes: ['category', 'sub_category'],
    });
    expect(rendering.mock.calls[1][1]).toBe(false);
  });

  it('Does not duplicate configuration', () => {
    const makeWidget = connectBreadcrumb(() => {});
    const widget = makeWidget({ attributes: ['category', 'sub_category'] });

    const partialConfiguration = widget.getConfiguration({
      hierarchicalFacets: [
        {
          attributes: ['category', 'sub_category'],
          name: 'category',
          rootPath: null,
          separator: ' > ',
          showParentLevel: true,
        },
      ],
    });

    expect(partialConfiguration).toEqual({});
  });

  it('provides the correct facet values', () => {
    const rendering = jest.fn();
    const makeWidget = connectBreadcrumb(rendering);
    const widget = makeWidget({ attributes: ['category', 'sub_category'] });

    const config = widget.getConfiguration({});
    const helper = jsHelper({}, '', config);
    helper.search = jest.fn();

    helper.toggleRefinement('category', 'Decoration');

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.items).toEqual([]);

    widget.render({
      results: new SearchResults(helper.state, [
        {
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
        },
        {
          facets: {
            category: {
              Decoration: 880,
              Outdoor: 47,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.items).toEqual([
      { name: 'Decoration', value: null },
    ]);
  });

  it('provides items from an empty results', () => {
    const rendering = jest.fn();
    const makeWidget = connectBreadcrumb(rendering);
    const widget = makeWidget({
      attributes: ['category', 'sub_category'],
    });

    const config = widget.getConfiguration({});
    const helper = jsHelper({}, '', config);

    helper.search = jest.fn();

    helper.toggleRefinement('category', 'Decoration');

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.items).toEqual([]);

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [],
          facets: {},
        },
        {
          hits: [],
          facets: {},
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.items).toEqual([]);
  });

  it('provides the correct facet values when transformed', () => {
    const rendering = jest.fn();
    const makeWidget = connectBreadcrumb(rendering);
    const widget = makeWidget({
      attributes: ['category', 'sub_category'],
      transformItems: items =>
        items.map(item => ({ ...item, name: 'transformed' })),
    });

    const config = widget.getConfiguration({});
    const helper = jsHelper({}, '', config);
    helper.search = jest.fn();

    helper.toggleRefinement('category', 'Decoration');

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.items).toEqual([]);

    widget.render({
      results: new SearchResults(helper.state, [
        {
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
        },
        {
          facets: {
            category: {
              Decoration: 880,
              Outdoor: 47,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.items).toEqual([
      expect.objectContaining({ name: 'transformed' }),
    ]);
  });

  it('returns the correct URL', () => {
    const rendering = jest.fn();
    const makeWidget = connectBreadcrumb(rendering);
    const widget = makeWidget({ attributes: ['category', 'sub_category'] });

    const config = widget.getConfiguration({});
    const helper = jsHelper({}, '', config);
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: state => state,
    });

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.items).toEqual([]);

    widget.render({
      results: new SearchResults(helper.state, [
        {
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
        },
        {
          facets: {
            category: {
              Decoration: 880,
              Outdoor: 47,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
      createURL: state => state,
    });
    const createURL = rendering.mock.calls[1][0].createURL;
    expect(helper.state.hierarchicalFacetsRefinements).toEqual({});
    const stateForURL = createURL('Decoration > Candle holders & candles');
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

    const config = widget.getConfiguration({});
    const helper = jsHelper({}, '', config);
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: state => state,
    });

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.items).toEqual([]);

    helper.toggleFacetRefinement(
      'hierarchicalCategories.lvl0',
      'Cameras & Camcorders > Digital Cameras > Digital SLR Cameras'
    );
    widget.render({
      results: new SearchResults(helper.state, [
        {
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
        },
        {
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
        },
        {
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
        },
      ]),
      state: helper.state,
      helper,
      createURL: state => state,
    });
    const { createURL, items } = rendering.mock.calls[1][0];
    const secondItemValue = items[1].value;

    const stateForURL = createURL(secondItemValue);

    expect(stateForURL.hierarchicalFacetsRefinements).toEqual({
      'hierarchicalCategories.lvl0': ['Cameras & Camcorders > Digital Cameras'],
    });
    const stateForHome = createURL(null);
    expect(stateForHome.hierarchicalFacetsRefinements).toEqual({
      'hierarchicalCategories.lvl0': [],
    });
  });

  it('toggles the refine function when passed the special value null', () => {
    const rendering = jest.fn();
    const makeWidget = connectBreadcrumb(rendering);
    const widget = makeWidget({ attributes: ['category', 'sub_category'] });

    const config = widget.getConfiguration({});
    const helper = jsHelper({}, '', config);
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.items).toEqual([]);

    helper.toggleRefinement('category', 'Decoration');

    widget.render({
      results: new SearchResults(helper.state, [
        {
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
        },
        {
          facets: {
            category: {
              Decoration: 880,
              Outdoor: 47,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });
    const refine = rendering.mock.calls[1][0].refine;
    expect(helper.getHierarchicalFacetBreadcrumb('category')).toEqual([
      'Decoration',
    ]);
    refine(null);
    expect(helper.getHierarchicalFacetBreadcrumb('category')).toEqual([]);
  });

  it('Provides a configuration if none exists', () => {
    const makeWidget = connectBreadcrumb(() => {});
    const widget = makeWidget({ attributes: ['category', 'sub_category'] });

    const partialConfiguration = widget.getConfiguration({});

    expect(partialConfiguration).toEqual({
      hierarchicalFacets: [
        {
          attributes: ['category', 'sub_category'],
          name: 'category',
          rootPath: null,
          separator: ' > ',
        },
      ],
    });
  });

  it('Provides an additional configuration if the existing one is different', () => {
    const makeWidget = connectBreadcrumb(() => {});
    const widget = makeWidget({ attributes: ['category', 'sub_category'] });

    const partialConfiguration = widget.getConfiguration({
      hierarchicalFacets: [
        {
          attributes: ['otherCategory', 'otherSub_category'],
          name: 'otherCategory',
          separator: ' > ',
        },
      ],
    });

    expect(partialConfiguration).toEqual({
      hierarchicalFacets: [
        {
          attributes: ['category', 'sub_category'],
          name: 'category',
          rootPath: null,
          separator: ' > ',
        },
      ],
    });
  });

  it('provides getRenderingOptions()', () => {
    const makeWidget = connectBreadcrumb(() => {});
    const widget = makeWidget({ attributes: ['category', 'sub_category'] });

    expect(widget.getRenderingOptions).toBeDefined();
  });
});
