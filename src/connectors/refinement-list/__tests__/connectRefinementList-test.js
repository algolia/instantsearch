import sinon from 'sinon';

import algoliasearchHelper from 'algoliasearch-helper';
const SearchResults = algoliasearchHelper.SearchResults;

import connectRefinementList from '../connectRefinementList.js';

const fakeClient = {addAlgoliaAgent: () => {}};

describe('connectRefinementList', () => {
  let rendering;
  let makeWidget;
  beforeEach(() => {
    rendering = sinon.stub();
    makeWidget = connectRefinementList(rendering);
  });

  it('throws on bad usage', () => {
    expect(
      connectRefinementList
    ).toThrow();

    expect(
      () => connectRefinementList({
        operator: 'and',
      })
    ).toThrow();

    expect(
      () => connectRefinementList(() => {})()
    ).toThrow();

    expect(
      () => connectRefinementList(() => {})({
        operator: 'and',
      })
    ).toThrow();

    expect(
      () => connectRefinementList(() => {})({
        attributeName: 'company',
        operator: 'YUP',
      })
    ).toThrow();
  });

  describe('options configuring the helper', () => {
    it('`attributeName`', () => {
      const widget = makeWidget({
        attributeName: 'myFacet',
      });

      expect(widget.getConfiguration())
        .toEqual({
          disjunctiveFacets: ['myFacet'],
        });
    });

    it('`limit`', () => {
      const widget = makeWidget({
        attributeName: 'myFacet',
        limit: 20,
      });

      expect(widget.getConfiguration())
        .toEqual({
          disjunctiveFacets: ['myFacet'],
          maxValuesPerFacet: 20,
        });

      expect(widget.getConfiguration({maxValuesPerFacet: 100}))
        .toEqual({
          disjunctiveFacets: ['myFacet'],
          maxValuesPerFacet: 100,
        }, 'Can read the previous maxValuesPerFacet value');
    });

    it('`operator="and"`', () => {
      const widget = makeWidget({
        attributeName: 'myFacet',
        operator: 'and',
      });

      expect(widget.getConfiguration())
        .toEqual({
          facets: ['myFacet'],
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
      disjunctiveFacets: ['myFacet'],
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

    const helper = algoliasearchHelper(fakeClient, '', widget.getConfiguration({}));
    helper.search = sinon.stub();

    helper.toggleRefinement('category', 'value');

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.lastCall.args[0];
    const {refine} = firstRenderingOptions;
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
    const {refine: renderToggleRefinement} = secondRenderingOptions;
    renderToggleRefinement('value');
    expect(helper.hasRefinements('category')).toBe(false);
    renderToggleRefinement('value');
    expect(helper.hasRefinements('category')).toBe(true);
  });

  it('provides the correct facet values', () => {
    const widget = makeWidget({
      attributeName: 'category',
    });

    const helper = algoliasearchHelper(fakeClient, '', widget.getConfiguration({}));
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
      results: new SearchResults(helper.state, [{
        hits: [],
        facets: {
          category: {
            Decoration: 880,
          },
        },
      }, {
        facets: {
          category: {
            Decoration: 880,
            Outdoor: 47,
          },
        },
      }]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.lastCall.args[0];
    expect(secondRenderingOptions.items).toEqual([
      {
        name: 'Decoration',
        highlighted: 'Decoration',
        count: 880,
        isRefined: true,
      },
      {
        name: 'Outdoor',
        highlighted: 'Outdoor',
        count: 47,
        isRefined: false,
      },
    ]);
  });

  it('provides the correct `currentRefinement` value', () => {
    const widget = makeWidget({attributeName: 'category'});

    const helper = algoliasearchHelper(fakeClient, '', widget.getConfiguration({}));
    helper.search = sinon.stub();

    helper.toggleRefinement('category', 'Decoration');

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.lastCall.args[0];
    expect(firstRenderingOptions.currentRefinement).toBe(null);

    widget.render({
      results: new SearchResults(helper.state, [{
        hits: [],
        facets: {
          category: {
            Decoration: 880,
          },
        },
      }, {
        facets: {
          category: {
            Decoration: 880,
            Outdoor: 47,
          },
        },
      }]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.lastCall.args[0];
    expect(secondRenderingOptions.currentRefinement).toEqual({
      name: 'Decoration',
      highlighted: 'Decoration',
      count: 880,
      isRefined: true,
    });
  });
});
