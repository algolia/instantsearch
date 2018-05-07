import sinon from 'sinon';

import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;

import connectClearRefinements from '../connectClearRefinements.js';

describe('connectClearRefinements', () => {
  it('Renders during init and render', () => {
    const helper = jsHelper({});
    helper.search = sinon.stub();
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectClearRefinements(rendering);
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

  it('some refinements from results <=> hasRefinements = true', () => {
    // test if the values sent to the rendering function
    // are consistent with the search state
    const helper = jsHelper({}, undefined, {
      facets: ['aFacet'],
    });
    helper.toggleRefinement('aFacet', 'some value');
    helper.search = sinon.stub();

    const rendering = sinon.stub();
    const makeWidget = connectClearRefinements(rendering);
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

  it('(clearsQuery: true) query not empty <=> hasRefinements = true', () => {
    // test if the values sent to the rendering function
    // are consistent with the search state
    const helper = jsHelper({}, undefined, {
      facets: ['aFacet'],
    });
    helper.setQuery('no empty');
    helper.search = sinon.stub();

    const rendering = sinon.stub();
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

    expect(rendering.lastCall.args[0].hasRefinements).toBe(true);

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(rendering.lastCall.args[0].hasRefinements).toBe(true);
  });

  it('(clearsQuery: false) no refinements <=> hasRefinements = false', () => {
    // test if the values sent to the rendering function
    // are consistent with the search state

    const helper = jsHelper({});
    helper.setQuery('not empty');
    helper.search = sinon.stub();

    const rendering = sinon.stub();
    const makeWidget = connectClearRefinements(rendering);
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
});
