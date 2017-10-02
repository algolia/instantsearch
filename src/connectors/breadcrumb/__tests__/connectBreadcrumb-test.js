import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;

import connectBreadcrumb from '../connectBreadcrumb.js';

describe('connectBreadcrumb', () => {
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
    expect(rendering.mock.calls.length).toBe(0);

    const helper = jsHelper({ addAlgoliaAgent: () => {} }, '', config);
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    // Verify that rendering has been called upon init with isFirstRendering = true
    expect(rendering.mock.calls.length).toBe(1);
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
    expect(rendering.mock.calls.length).toBe(2);
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
    const helper = jsHelper({ addAlgoliaAgent: () => {} }, '', config);
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
      { name: 'Decoration', value: 'Decoration' },
    ]);
  });

  it('returns the correct URL', () => {
    const rendering = jest.fn();
    const makeWidget = connectBreadcrumb(rendering);
    const widget = makeWidget({ attributes: ['category', 'sub_category'] });

    const config = widget.getConfiguration({});
    const helper = jsHelper({ addAlgoliaAgent: () => {} }, '', config);
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
    // 3 levels
    const widget = makeWidget({
      attributes: ['category', 'sub_category', 'sub_sub_category'],
    });

    const config = widget.getConfiguration({});
    console.log(JSON.stringify(config, null, 2));
    const helper = jsHelper({ addAlgoliaAgent: () => {} }, '', config);
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: state => state,
    });

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.items).toEqual([]);

    helper.toggleFacetRefinement(
      'category',
      'Cameras & Camcorders > Digital Cameras > Digital SLR Cameras'
    );

    console.log('helperstate', helper.state);
    // retrieve a querie with 3 levels and a simplified object
    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [],
          facets: {
            category: {
              'Cameras & Camcorders': 880,
            },
            subCategory: {
              'Cameras & Camcorders > Digital Cameras': 170,
            },
            subSubCategory: {
              'Cameras & Camcorders > Digital Cameras > Point & Shoot Cameras': 84,
              'Cameras & Camcorders > Digital Cameras > Digital SLR Cameras': 44,
              'Cameras & Camcorders > Digital Cameras > Mirrorless Cameras': 29,
            },
          },
        },
        {
          facets: {
            category: {
              'Cameras & Camcorders': 880,
            },
            subCategory: {
              Binoculars: 20,
              'Cameras & Camcorders > Digital Cameras': 170,
              Camcorders: 50,
              'Memory Cards': 113,
              Microscopes: 5,
            },
          },
        },
        {
          facets: {
            category: {
              Appliances: 4306,
              'Cameras & Camcorders': 880,
              'Computers & Tablets': 3563,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
      createURL: state => state,
    });
    const { createURL, items } = rendering.mock.calls[1][0];
    const toto = items[0].value;
    console.log('toto', items);
    const stateForURL = createURL(toto);
    expect(stateForURL.hierarchicalFacetsRefinements).toEqual({
      category: [toto],
    });
    const stateForHome = createURL([]);
    expect(stateForHome.hierarchicalFacetsRefinements).toEqual({
      category: [[]],
    });
  });

  it('toggles the refine function when passed the special value null', () => {
    const rendering = jest.fn();
    const makeWidget = connectBreadcrumb(rendering);
    const widget = makeWidget({ attributes: ['category', 'sub_category'] });

    const config = widget.getConfiguration({});
    const helper = jsHelper({ addAlgoliaAgent: () => {} }, '', config);
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
});
