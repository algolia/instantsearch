import sinon from 'sinon';

import algoliasearchHelper from 'algoliasearch-helper';
const SearchResults = algoliasearchHelper.SearchResults;

import connectMenu from '../connectMenu.js';

const fakeClient = { addAlgoliaAgent: () => {} };

describe('connectMenu', () => {
  let rendering;
  let makeWidget;
  beforeEach(() => {
    rendering = sinon.stub();
    makeWidget = connectMenu(rendering);
  });

  it('throws on bad usage', () => {
    expect(connectMenu).toThrow();

    expect(() => connectMenu({})).toThrow();

    expect(() => connectMenu(() => {})()).toThrow();

    expect(() => connectMenu({ limit: 10 })).toThrow();

    expect(() => connectMenu(() => {})({ limit: 10 })).toThrow();
  });

  describe('options configuring the helper', () => {
    it('`attributeName`', () => {
      const widget = makeWidget({
        attributeName: 'myFacet',
      });

      expect(widget.getConfiguration({})).toEqual({
        hierarchicalFacets: [
          {
            name: 'myFacet',
            attributes: ['myFacet'],
          },
        ],
        maxValuesPerFacet: 10,
      });
    });

    it('`limit`', () => {
      const widget = makeWidget({
        attributeName: 'myFacet',
        limit: 20,
      });

      expect(widget.getConfiguration({})).toEqual({
        hierarchicalFacets: [
          {
            name: 'myFacet',
            attributes: ['myFacet'],
          },
        ],
        maxValuesPerFacet: 20,
      });
    });
  });

  it('Renders during init and render', () => {
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const widget = makeWidget({
      attributeName: 'myFacet',
      limit: 9,
    });

    const config = widget.getConfiguration({});
    expect(config).toEqual({
      hierarchicalFacets: [
        {
          name: 'myFacet',
          attributes: ['myFacet'],
        },
      ],
      maxValuesPerFacet: 9,
    });

    // test if widget is not rendered yet at this point
    expect(rendering.callCount).toBe(0);

    const helper = algoliasearchHelper(fakeClient, '', config);
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    // test that rendering has been called during init with isFirstRendering = true
    expect(rendering.callCount).toBe(1);
    // test if isFirstRendering is true during init
    expect(rendering.lastCall.args[1]).toBe(true);

    const firstRenderingOptions = rendering.lastCall.args[0];
    expect(firstRenderingOptions.canRefine).toBe(false);
    expect(firstRenderingOptions.widgetParams).toEqual({
      attributeName: 'myFacet',
      limit: 9,
    });

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    // test that rendering has been called during init with isFirstRendering = false
    expect(rendering.callCount).toBe(2);
    expect(rendering.lastCall.args[1]).toBe(false);

    const secondRenderingOptions = rendering.lastCall.args[0];
    expect(secondRenderingOptions.canRefine).toBe(false);
    expect(secondRenderingOptions.widgetParams).toEqual({
      attributeName: 'myFacet',
      limit: 9,
    });
  });

  it('Provide a function to clear the refinements at each step', () => {
    const widget = makeWidget({
      attributeName: 'category',
    });

    const helper = algoliasearchHelper(
      fakeClient,
      '',
      widget.getConfiguration({})
    );
    helper.search = sinon.stub();

    helper.toggleRefinement('category', 'value');

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.lastCall.args[0];
    const { refine } = firstRenderingOptions;
    refine('value');
    expect(helper.hasRefinements('category')).toBe(false);
    refine('value');
    expect(helper.hasRefinements('category')).toBe(true);

    widget.render({
      results: new SearchResults(helper.state, [{}, {}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.lastCall.args[0];
    const { refine: renderRefine } = secondRenderingOptions;
    renderRefine('value');
    expect(helper.hasRefinements('category')).toBe(false);
    renderRefine('value');
    expect(helper.hasRefinements('category')).toBe(true);
  });

  it('provides the correct facet values', () => {
    const widget = makeWidget({
      attributeName: 'category',
    });

    const helper = algoliasearchHelper(
      fakeClient,
      '',
      widget.getConfiguration({})
    );
    helper.search = sinon.stub();

    helper.toggleRefinement('category', 'Decoration');

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.lastCall.args[0];
    // During the first rendering there are no facet values
    // The function get an empty array so that it doesn't break
    // over null-ish values.
    expect(firstRenderingOptions.items).toEqual([]);

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [],
          facets: {
            category: {
              Decoration: 880,
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

    const secondRenderingOptions = rendering.lastCall.args[0];
    expect(secondRenderingOptions.items).toEqual([
      {
        label: 'Decoration',
        value: 'Decoration',
        count: 880,
        isRefined: true,
        data: null,
      },
      {
        label: 'Outdoor',
        value: 'Outdoor',
        count: 47,
        isRefined: false,
        data: null,
      },
    ]);
  });

  describe('showMore', () => {
    it('should throw when `showMoreLimit` is lower than `limit`', () => {
      expect(() =>
        connectMenu(() => {})({
          attributeName: 'myFacet',
          limit: 10,
          showMoreLimit: 1,
        })
      ).toThrow();
    });

    it('should provide `showMoreLimit` as `maxValuesPerFacet`', () => {
      const widget = makeWidget({
        attributeName: 'myFacet',
        limit: 10,
        showMoreLimit: 20,
      });

      expect(widget.getConfiguration({})).toEqual({
        hierarchicalFacets: [
          {
            name: 'myFacet',
            attributes: ['myFacet'],
          },
        ],
        maxValuesPerFacet: 20,
      });
    });

    it('should initialize with `isShowingMore === false`', () => {
      // Given
      const widget = makeWidget({
        attributeName: 'myFacet',
        limit: 10,
        showMoreLimit: 20,
      });

      // When
      const config = widget.getConfiguration({});
      const helper = algoliasearchHelper(fakeClient, '', config);
      helper.search = jest.fn();

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
        onHistoryChange: () => {},
      });

      // Then
      const firstRenderingOptions = rendering.lastCall.args[0];
      expect(firstRenderingOptions.isShowingMore).toBe(false);
    });

    it('should toggle `isShowingMore` when `toggleShowMore` is called', () => {
      // Given
      const widget = makeWidget({
        attributeName: 'category',
        limit: 1,
        showMoreLimit: 2,
      });

      // When
      const config = widget.getConfiguration({});
      const helper = algoliasearchHelper(fakeClient, '', config);

      helper.search = jest.fn();
      helper.toggleRefinement('category', 'Decoration');

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
        onHistoryChange: () => {},
      });

      widget.render({
        results: new SearchResults(helper.state, [
          {
            hits: [],
            facets: {
              category: {
                Decoration: 880,
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

      // Then
      const firstRenderingOptions = rendering.lastCall.args[0];
      expect(firstRenderingOptions.isShowingMore).toBe(false);
      expect(firstRenderingOptions.items).toHaveLength(1);
      expect(firstRenderingOptions.canToggleShowMore).toBe(true);

      // When
      firstRenderingOptions.toggleShowMore();

      // Then
      const secondRenderingOptions = rendering.lastCall.args[0];
      expect(secondRenderingOptions.isShowingMore).toBe(true);
      expect(secondRenderingOptions.items).toHaveLength(2);
      expect(firstRenderingOptions.canToggleShowMore).toBe(true);
    });

    it('should set canToggleShowMore to false when there are not enough items', () => {
      // Given
      const widget = makeWidget({
        attributeName: 'category',
        limit: 1,
        showMoreLimit: 2,
      });

      // When
      const config = widget.getConfiguration({});
      const helper = algoliasearchHelper(fakeClient, '', config);

      helper.search = jest.fn();
      helper.toggleRefinement('category', 'Decoration');

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
        onHistoryChange: () => {},
      });

      widget.render({
        results: new SearchResults(helper.state, [
          {
            hits: [],
            facets: {
              category: {
                Decoration: 880,
              },
            },
          },
          {
            facets: {
              category: {
                Decoration: 880,
              },
            },
          },
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      });

      const firstRenderingOptions = rendering.lastCall.args[0];
      expect(firstRenderingOptions.items).toHaveLength(1);
      expect(firstRenderingOptions.canToggleShowMore).toBe(false);
    });
  });
});
