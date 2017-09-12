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

  it('Provides a configuration if none exists', () => {
    const makeWidget = connectBreadcrumb(() => {});
    const widget = makeWidget({ attributes: ['category', 'sub_category'] });

    const partialConfiguration = widget.getConfiguration({});

    expect(partialConfiguration).toEqual({
      hierarchicalFacets: [
        {
          attributes: ['category', 'sub_category'],
          name: 'category',
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
          separator: ' > ',
        },
      ],
    });
  });
});
