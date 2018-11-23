import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;

import connectClearRefinements from '../connectClearRefinements';

describe('connectClearRefinements', () => {
  it('Renders during init and render', () => {
    const helper = jsHelper({});
    helper.search = () => {};
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = jest.fn();
    const makeWidget = connectClearRefinements(rendering);
    const widget = makeWidget({
      foo: 'bar', // dummy param to test `widgetParams`
    });

    expect(widget.getConfiguration).toBe(undefined);
    // test if widget is not rendered yet at this point
    expect(rendering).toHaveBeenCalledTimes(0);

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    // test that rendering has been called during init with isFirstRendering = true
    expect(rendering).toHaveBeenCalledTimes(1);
    // test if isFirstRendering is true during init
    expect(rendering.mock.calls[0][1]).toBe(true);

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.hasRefinements).toBe(false);
    expect(firstRenderingOptions.widgetParams).toEqual({
      foo: 'bar', // dummy param to test `widgetParams`
    });

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    // test that rendering has been called during init with isFirstRendering = false
    expect(rendering).toHaveBeenCalledTimes(2);
    expect(rendering.mock.calls[1][1]).toBe(false);

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.hasRefinements).toBe(false);
  });

  it('Receives a mean to clear the values', () => {
    // test the function received by the rendering function
    // to clear the refinements

    const helper = jsHelper({}, '', {
      facets: ['myFacet'],
    });
    helper.search = () => {};
    helper.setQuery('not empty');
    helper.toggleRefinement('myFacet', 'myValue');

    const rendering = jest.fn();
    const makeWidget = connectClearRefinements(rendering);
    const widget = makeWidget({ clearsQuery: false });

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    expect(helper.hasRefinements('myFacet')).toBe(true);
    expect(helper.state.query).toBe('not empty');
    const initClearMethod = rendering.mock.calls[0][0].refine;
    initClearMethod();

    expect(helper.hasRefinements('myFacet')).toBe(false);
    expect(helper.state.query).toBe('not empty');

    helper.toggleRefinement('myFacet', 'someOtherValue');

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(helper.hasRefinements('myFacet')).toBe(true);
    expect(helper.state.query).toBe('not empty');
    const renderClearMethod = rendering.mock.calls[1][0].refine;
    renderClearMethod();
    expect(helper.hasRefinements('myFacet')).toBe(false);
    expect(helper.state.query).toBe('not empty');
  });

  it('Receives a mean to clear the values (and the query)', () => {
    // test the function received by the rendering function
    // to clear the refinements

    const helper = jsHelper({}, '', {
      facets: ['myFacet'],
    });
    helper.search = () => {};
    helper.setQuery('a query');
    helper.toggleRefinement('myFacet', 'myValue');

    const rendering = jest.fn();
    const makeWidget = connectClearRefinements(rendering);
    const widget = makeWidget({ clearsQuery: true });

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    expect(helper.hasRefinements('myFacet')).toBe(true);
    expect(helper.state.query).toBe('a query');
    const initClearMethod = rendering.mock.calls[0][0].refine;
    initClearMethod();

    expect(helper.hasRefinements('myFacet')).toBe(false);
    expect(helper.state.query).toBe('');

    helper.toggleRefinement('myFacet', 'someOtherValue');
    helper.setQuery('another query');

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(helper.hasRefinements('myFacet')).toBe(true);
    expect(helper.state.query).toBe('another query');
    const renderClearMethod = rendering.mock.calls[1][0].refine;
    renderClearMethod();
    expect(helper.hasRefinements('myFacet')).toBe(false);
    expect(helper.state.query).toBe('');
  });

  it('some refinements from results <-> hasRefinements = true', () => {
    // test if the values sent to the rendering function
    // are consistent with the search state
    const helper = jsHelper({}, undefined, {
      facets: ['aFacet'],
    });
    helper.toggleRefinement('aFacet', 'some value');
    helper.search = () => {};

    const rendering = jest.fn();
    const makeWidget = connectClearRefinements(rendering);
    const widget = makeWidget();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    expect(rendering.mock.calls[0][0].hasRefinements).toBe(true);

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(rendering.mock.calls[1][0].hasRefinements).toBe(true);
  });

  it('(clearsQuery: true) query not empty <-> hasRefinements = true', () => {
    // test if the values sent to the rendering function
    // are consistent with the search state
    const helper = jsHelper({}, undefined, {
      facets: ['aFacet'],
    });
    helper.setQuery('no empty');
    helper.search = () => {};

    const rendering = jest.fn();
    const makeWidget = connectClearRefinements(rendering);
    const widget = makeWidget({
      clearsQuery: true,
    });

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    expect(rendering.mock.calls[0][0].hasRefinements).toBe(true);

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(rendering.mock.calls[1][0].hasRefinements).toBe(true);
  });

  it('(clearsQuery: true) no refinements <-> hasRefinements = false', () => {
    // test if the values sent to the rendering function
    // are consistent with the search state
    const helper = jsHelper({}, undefined, {
      facets: ['aFacet'],
    });
    helper.search = () => {};

    const rendering = jest.fn();
    const makeWidget = connectClearRefinements(rendering);
    const widget = makeWidget({
      clearsQuery: true,
    });

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    expect(rendering.mock.calls[0][0].hasRefinements).toBe(false);

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(rendering.mock.calls[1][0].hasRefinements).toBe(false);
  });

  it('(clearsQuery: false) no refinements <=> hasRefinements = false', () => {
    // test if the values sent to the rendering function
    // are consistent with the search state

    const helper = jsHelper({});
    helper.setQuery('not empty');
    helper.search = () => {};

    const rendering = jest.fn();
    const makeWidget = connectClearRefinements(rendering);
    const widget = makeWidget({ clearsQuery: false });

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    expect(rendering.mock.calls[0][0].hasRefinements).toBe(false);

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(rendering.mock.calls[1][0].hasRefinements).toBe(false);
  });

  it('can include some attributes', () => {
    const helper = jsHelper({ addAlgoliaAgent: () => {} }, '', {
      facets: ['facet1', 'facet2'],
    });
    helper.search = () => {};

    const rendering = jest.fn();
    const makeWidget = connectClearRefinements(rendering);
    const widget = makeWidget({ includedAttributes: ['facet1'] });

    {
      helper.toggleRefinement('facet1', 'value')
        .toggleRefinement('facet2', 'value');

      helper.setQuery('not empty');

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
        onHistoryChange: () => {},
      });

      expect(helper.hasRefinements('facet1')).toBe(true);
      expect(helper.hasRefinements('facet2')).toBe(true);

      const refine = rendering.mock.calls[0][0].refine;
      refine();
      widget.render({
        helper,
        state: helper.state,
        createURL: () => '#',
        onHistoryChange: () => {},
      })
      expect(helper.hasRefinements('facet1')).toBe(false);
      expect(helper.hasRefinements('facet2')).toBe(true);
      expect(rendering.mock.calls[1][0].hasRefinements).toBe(false);
    }
  });

  it('can exclude some attributes', () => {
    const helper = jsHelper({ addAlgoliaAgent: () => {} }, '', {
      facets: ['facet'],
    });
    helper.search = () => {};

    const rendering = jest.fn();
    const makeWidget = connectClearRefinements(rendering);
    const widget = makeWidget({
      excludedAttributes: ['facet'],
    });

    helper.toggleRefinement('facet', 'value');

    {
      helper.setQuery('not empty');

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
        onHistoryChange: () => {},
      });

      expect(helper.hasRefinements('facet')).toBe(true);

      const refine = rendering.mock.calls[0][0].refine;
      refine();

      expect(helper.hasRefinements('facet')).toBe(true);
    }

    {
      // facet has not been cleared and it is still refined with value
      helper.setQuery('not empty');

      widget.render({
        helper,
        state: helper.state,
        results: new SearchResults(helper.state, [{}]),
        createURL: () => '#',
        onHistoryChange: () => {},
      });

      expect(helper.hasRefinements('facet')).toBe(true);

      const refine = rendering.mock.calls[1][0].refine;
      refine();

      expect(helper.hasRefinements('facet')).toBe(true);
    }
  });

  it('can exclude some attributes when clearsQuery is active', () => {
    const helper = jsHelper({ addAlgoliaAgent: () => {} }, '', {
      facets: ['facet'],
    });
    helper.search = () => {};

    const rendering = jest.fn();
    const makeWidget = connectClearRefinements(rendering);
    const widget = makeWidget({
      excludedAttributes: ['facet'],
      clearsQuery: true,
    });

    helper.toggleRefinement('facet', 'value');

    {
      helper.setQuery('not empty');

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
        onHistoryChange: () => {},
      });

      expect(helper.hasRefinements('facet')).toBe(true);

      const refine = rendering.mock.calls[0][0].refine;
      refine();

      expect(helper.hasRefinements('facet')).toBe(true);
    }

    {
      helper.setQuery('not empty');

      widget.render({
        helper,
        state: helper.state,
        results: new SearchResults(helper.state, [{}]),
        createURL: () => '#',
        onHistoryChange: () => {},
      });

      expect(helper.hasRefinements('facet')).toBe(true);

      const refine = rendering.mock.calls[1][0].refine;
      refine();

      expect(helper.hasRefinements('facet')).toBe(true);
    }
  });

  it('throws an error when some included is used with excluded', () => {
    const helper = jsHelper(
      {
        addAlgoliaAgent: () => {},
      },
      '',
      {
        facets: ['facet1', 'facet2'],
      }
    );
    helper.search = () => {};

    const rendering = jest.fn();
    const makeWidget = connectClearRefinements(rendering);
    expect(() => {
      makeWidget({
        includedAttributes: ['facet1'],
        excludedAttributes: ['facet2'],
        clearsQuery: true,
      });
    }).toThrowErrorMatchingInlineSnapshot(
      `"\`includedAttributes\` and \`excludedAttributes\` cannot be used together."`
    );
  });
  describe('createURL', () => {
    it('consistent with the list of excludedAttributes', () => {
      const helper = jsHelper({ addAlgoliaAgent: () => {} }, '', {
        facets: ['facet', 'otherFacet'],
      });
      helper.search = () => {};

      const rendering = jest.fn();
      const makeWidget = connectClearRefinements(rendering);
      const widget = makeWidget({
        excludedAttributes: ['facet'],
        clearsQuery: true,
      });

      helper.toggleRefinement('facet', 'value');
      helper.toggleRefinement('otherFacet', 'value');

      {
        helper.setQuery('not empty');

        widget.init({
          helper,
          state: helper.state,
          createURL: opts => opts,
          onHistoryChange: () => {},
        });

        const { createURL, refine } = rendering.mock.calls[0][0];

        // The state represented by the URL should be equal to a state
        // after refining.
        const createURLState = createURL();
        refine();
        const stateAfterRefine = helper.state;

        expect(createURLState).toEqual(stateAfterRefine);
      }

      {
        widget.render({
          helper,
          state: helper.state,
          results: new SearchResults(helper.state, [{}]),
          createURL: () => '#',
          onHistoryChange: () => {},
        });

        const { createURL, refine } = rendering.mock.calls[1][0];

        const createURLState = createURL();
        refine();
        const stateAfterRefine = helper.state;

        expect(createURLState).toEqual(stateAfterRefine);
      }
    });
  });
});
