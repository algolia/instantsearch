import sinon from 'sinon';

import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;

import connectClearAll from '../connectClearAll.js';

describe('connectClearAll', () => {
  it('Renders during init and render', () => {
    const helper = jsHelper({});
    helper.search = sinon.stub();
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectClearAll(rendering);
    const widget = makeWidget({
      foo: 'bar', // dummy param to test `widgetParams`
    });

    expect(widget.getConfiguration).toBe(undefined);
    // test if widget is not rendered yet at this point
    expect(rendering.callCount).toBe(0);

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
    expect(rendering.callCount).toBe(2);
    expect(rendering.lastCall.args[1]).toBe(false);

    const secondRenderingOptions = rendering.lastCall.args[0];
    expect(secondRenderingOptions.hasRefinements).toBe(false);
  });

  it('Receives a mean to clear the values', () => {
    // test the function received by the rendering function
    // to clear the refinements

    const helper = jsHelper({}, '', {
      facets: ['myFacet'],
    });
    helper.search = sinon.stub();
    helper.setQuery('not empty');
    helper.toggleRefinement('myFacet', 'myValue');

    const rendering = sinon.stub();
    const makeWidget = connectClearAll(rendering);
    const widget = makeWidget({ clearsQuery: false });

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    expect(helper.hasRefinements('myFacet')).toBe(true);
    expect(helper.state.query).toBe('not empty');
    const initClearMethod = rendering.lastCall.args[0].refine;
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
    const renderClearMethod = rendering.lastCall.args[0].refine;
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
    helper.search = sinon.stub();
    helper.setQuery('a query');
    helper.toggleRefinement('myFacet', 'myValue');

    const rendering = sinon.stub();
    const makeWidget = connectClearAll(rendering);
    const widget = makeWidget({ clearsQuery: true });

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    expect(helper.hasRefinements('myFacet')).toBe(true);
    expect(helper.state.query).toBe('a query');
    const initClearMethod = rendering.lastCall.args[0].refine;
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
    const renderClearMethod = rendering.lastCall.args[0].refine;
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
    helper.search = sinon.stub();

    const rendering = sinon.stub();
    const makeWidget = connectClearAll(rendering);
    const widget = makeWidget();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    expect(rendering.lastCall.args[0].hasRefinements).toBe(true);

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(rendering.lastCall.args[0].hasRefinements).toBe(true);
  });

  it('(clearsQuery: true) query not empty <-> hasRefinements = true', () => {
    // test if the values sent to the rendering function
    // are consistent with the search state
    const helper = jsHelper({}, undefined, {
      facets: ['aFacet'],
    });
    helper.setQuery('no empty');
    helper.search = sinon.stub();

    const rendering = sinon.stub();
    const makeWidget = connectClearAll(rendering);
    const widget = makeWidget({
      clearsQuery: true,
    });

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    expect(rendering.lastCall.args[0].hasRefinements).toBe(true);

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(rendering.lastCall.args[0].hasRefinements).toBe(true);
  });

  it('(clearsQuery: true) no refinements <-> hasRefinements = false', () => {
    // test if the values sent to the rendering function
    // are consistent with the search state
    const helper = jsHelper({}, undefined, {
      facets: ['aFacet'],
    });
    helper.search = sinon.stub();

    const rendering = sinon.stub();
    const makeWidget = connectClearAll(rendering);
    const widget = makeWidget({
      clearsQuery: true,
    });

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    expect(rendering.lastCall.args[0].hasRefinements).toBe(false);

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(rendering.lastCall.args[0].hasRefinements).toBe(false);
  });

  it('(clearsQuery: false) no refinements <=> hasRefinements = false', () => {
    // test if the values sent to the rendering function
    // are consistent with the search state

    const helper = jsHelper({});
    helper.setQuery('not empty');
    helper.search = sinon.stub();

    const rendering = sinon.stub();
    const makeWidget = connectClearAll(rendering);
    const widget = makeWidget({ clearsQuery: false });

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    expect(rendering.lastCall.args[0].hasRefinements).toBe(false);

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(rendering.lastCall.args[0].hasRefinements).toBe(false);
  });

  it('can exclude some attributes', () => {
    const helper = jsHelper({ addAlgoliaAgent: () => {} }, '', {
      facets: ['facet'],
    });
    helper.search = sinon.stub();

    const rendering = sinon.stub();
    const makeWidget = connectClearAll(rendering);
    const widget = makeWidget({
      excludeAttributes: ['facet'],
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

      const refine = rendering.lastCall.args[0].refine;
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

      const refine = rendering.lastCall.args[0].refine;
      refine();

      expect(helper.hasRefinements('facet')).toBe(true);
    }
  });

  it('can exclude some attributes when clearsQuery is active', () => {
    const helper = jsHelper({ addAlgoliaAgent: () => {} }, '', {
      facets: ['facet'],
    });
    helper.search = sinon.stub();

    const rendering = sinon.stub();
    const makeWidget = connectClearAll(rendering);
    const widget = makeWidget({
      excludeAttributes: ['facet'],
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

      const refine = rendering.lastCall.args[0].refine;
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

      const refine = rendering.lastCall.args[0].refine;
      refine();

      expect(helper.hasRefinements('facet')).toBe(true);
    }
  });

  describe('createURL', () => {
    it('consistent with the list of excludedAttributes', () => {
      const helper = jsHelper({ addAlgoliaAgent: () => {} }, '', {
        facets: ['facet', 'otherFacet'],
      });
      helper.search = sinon.stub();

      const rendering = sinon.stub();
      const makeWidget = connectClearAll(rendering);
      const widget = makeWidget({
        excludeAttributes: ['facet'],
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

        const createURL = rendering.lastCall.args[0].createURL;
        const refine = rendering.lastCall.args[0].refine;

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

        const createURL = rendering.lastCall.args[0].createURL;
        const refine = rendering.lastCall.args[0].refine;

        const createURLState = createURL();
        refine();
        const stateAfterRefine = helper.state;

        expect(createURLState).toEqual(stateAfterRefine);
      }
    });
  });
});
