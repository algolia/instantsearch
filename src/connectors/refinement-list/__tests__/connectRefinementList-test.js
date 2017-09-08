import sinon from 'sinon';

import algoliasearchHelper from 'algoliasearch-helper';
const SearchResults = algoliasearchHelper.SearchResults;

import connectRefinementList from '../connectRefinementList.js';

const fakeClient = { addAlgoliaAgent: () => {} };

describe('connectRefinementList', () => {
  let rendering;
  let makeWidget;
  beforeEach(() => {
    rendering = sinon.stub();
    makeWidget = connectRefinementList(rendering);
  });

  it('throws on bad usage', () => {
    expect(connectRefinementList).toThrow();

    expect(() =>
      connectRefinementList({
        operator: 'and',
      })
    ).toThrow();

    expect(() => connectRefinementList(() => {})()).toThrow();

    expect(() =>
      connectRefinementList(() => {})({
        operator: 'and',
      })
    ).toThrow();

    expect(() =>
      connectRefinementList(() => {})({
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

      expect(widget.getConfiguration()).toEqual({
        disjunctiveFacets: ['myFacet'],
      });
    });

    it('`limit`', () => {
      const widget = makeWidget({
        attributeName: 'myFacet',
        limit: 20,
      });

      expect(widget.getConfiguration()).toEqual({
        disjunctiveFacets: ['myFacet'],
        maxValuesPerFacet: 20,
      });

      expect(widget.getConfiguration({ maxValuesPerFacet: 100 })).toEqual(
        {
          disjunctiveFacets: ['myFacet'],
          maxValuesPerFacet: 100,
        },
        'Can read the previous maxValuesPerFacet value'
      );
    });

    it('`operator="and"`', () => {
      const widget = makeWidget({
        attributeName: 'myFacet',
        operator: 'and',
      });

      expect(widget.getConfiguration()).toEqual({
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
    const { refine: renderToggleRefinement } = secondRenderingOptions;
    renderToggleRefinement('value');
    expect(helper.hasRefinements('category')).toBe(false);
    renderToggleRefinement('value');
    expect(helper.hasRefinements('category')).toBe(true);
  });

  it('If there are too few items then canToggleShowMore is false', () => {
    const widget = makeWidget({
      attributeName: 'category',
      limit: 3,
      showMoreLimit: 10,
    });

    const helper = algoliasearchHelper(
      fakeClient,
      '',
      widget.getConfiguration({})
    );
    helper.search = sinon.stub();

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
              c1: 880,
              c2: 47,
            },
          },
        },
        {
          facets: {
            category: {
              c1: 880,
              c2: 47,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.lastCall.args[0];
    expect(secondRenderingOptions.canToggleShowMore).toBe(false);
  });

  it('If there are enough items then canToggleShowMore is true', () => {
    const widget = makeWidget({
      attributeName: 'category',
      limit: 1,
      showMoreLimit: 10,
    });

    const helper = algoliasearchHelper(
      fakeClient,
      '',
      widget.getConfiguration({})
    );
    helper.search = sinon.stub();

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
              c1: 880,
              c2: 47,
            },
          },
        },
        {
          facets: {
            category: {
              c1: 880,
              c2: 47,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.lastCall.args[0];
    expect(secondRenderingOptions.canToggleShowMore).toBe(true);

    // toggleShowMore will set the state of the show more to true
    // therefore it's always possible to go back and show less items
    secondRenderingOptions.toggleShowMore();

    const thirdRenderingOptions = rendering.lastCall.args[0];
    expect(thirdRenderingOptions.canToggleShowMore).toBe(true);
  });

  it('Show more should toggle between two limits', () => {
    const widget = makeWidget({
      attributeName: 'category',
      limit: 1,
      showMoreLimit: 3,
    });

    const helper = algoliasearchHelper(
      fakeClient,
      '',
      widget.getConfiguration({})
    );
    helper.search = sinon.stub();

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
              c1: 880,
              c2: 47,
              c3: 880,
              c4: 47,
            },
          },
        },
        {
          facets: {
            category: {
              c1: 880,
              c2: 47,
              c3: 880,
              c4: 47,
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
        label: 'c1',
        value: 'c1',
        highlighted: 'c1',
        count: 880,
        isRefined: false,
      },
    ]);

    // toggleShowMore does a new render
    secondRenderingOptions.toggleShowMore();

    const thirdRenderingOptions = rendering.lastCall.args[0];
    expect(thirdRenderingOptions.items).toEqual([
      {
        label: 'c1',
        value: 'c1',
        highlighted: 'c1',
        count: 880,
        isRefined: false,
      },
      {
        label: 'c3',
        value: 'c3',
        highlighted: 'c3',
        count: 880,
        isRefined: false,
      },
      {
        label: 'c2',
        value: 'c2',
        highlighted: 'c2',
        count: 47,
        isRefined: false,
      },
    ]);
  });

  it('hasExhaustiveItems indicates if the items provided are exhaustive', () => {
    const widget = makeWidget({
      attributeName: 'category',
      limit: 2,
    });

    const helper = algoliasearchHelper(
      fakeClient,
      '',
      widget.getConfiguration({})
    );
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    expect(rendering.lastCall.args[0].hasExhaustiveItems).toEqual(true);

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [],
          facets: {
            category: {
              c1: 880,
            },
          },
        },
        {
          facets: {
            category: {
              c1: 880,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(rendering.lastCall.args[0].hasExhaustiveItems).toEqual(true);

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [],
          facets: {
            category: {
              c1: 880,
              c2: 34,
              c3: 440,
            },
          },
        },
        {
          facets: {
            category: {
              c1: 880,
              c2: 34,
              c3: 440,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(rendering.lastCall.args[0].hasExhaustiveItems).toEqual(false);
  });
});
