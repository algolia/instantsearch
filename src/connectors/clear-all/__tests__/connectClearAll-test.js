/* eslint-env mocha */

import expect from 'expect';
import sinon from 'sinon';

import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;

import connectClearAll from '../connectClearAll.js';

describe.only('connectClearAll', () => {
  it('Renders during init and render', () => {
    const helper = jsHelper({});
    helper.search = sinon.stub();
    const container = document.createElement('div');
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectClearAll(rendering);
    const widget = makeWidget({
      container,
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
    expect(rendering.lastCall.args[1]).toBe(true);

    const firstRenderingOptions = rendering.lastCall.args[0];
    expect(firstRenderingOptions.containerNode).toBe(container);
    expect(firstRenderingOptions.hasRefinements).toBe(false);
    expect(firstRenderingOptions.collapsible).toBe(false);
    expect(firstRenderingOptions.shouldAutoHideContainer).toBe(true);

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
    expect(secondRenderingOptions.containerNode).toBe(container);
    expect(secondRenderingOptions.hasRefinements).toBe(false);
    expect(secondRenderingOptions.collapsible).toBe(false);
    expect(secondRenderingOptions.shouldAutoHideContainer).toBe(true);
  });

  it('Receives a mean to clear the values', () => {
    // test the function received by the rendering function
    // to clear the refinements

    const helper = jsHelper({}, '', {facets: ['myFacet']});
    helper.search = sinon.stub();
    helper.toggleRefinement('myFacet', 'myValue');

    const container = document.createElement('div');
    const rendering = sinon.stub();
    const makeWidget = connectClearAll(rendering);
    const widget = makeWidget({
      container,
    });

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    expect(helper.hasRefinements('myFacet')).toBe(true);
    const initClearMethod = rendering.lastCall.args[0].clearAll;
    initClearMethod();

    // The clearing function only works when results are received
    // At this point of the lifecycle we don't have results yet
    // that's why the search state still contains refinements
    expect(helper.hasRefinements('myFacet')).toBe(true);

    helper.toggleRefinement('myFacet', 'someOtherValue');

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    // expect(helper.hasRefinements('myFacet')).toBe(true);
    // const renderClearMethod = rendering.lastCall.args[0].clearAll;
    // renderClearMethod();
    // expect(helper.hasRefinements('myFacet')).toBe(false);
  });

  it('some refinements from results <=> hasRefinements = true', () => {
    // test if the values sent to the rendering function
    // are consistent with the search state
    const helper = jsHelper({}, undefined, {facets: ['aFacet']});
    helper.toggleRefinement('aFacet', 'some value');
    helper.search = sinon.stub();

    const container = document.createElement('div');
    const rendering = sinon.stub();
    const makeWidget = connectClearAll(rendering);
    const widget = makeWidget({
      container,
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

    expect(rendering.lastCall.args[0].hasRefinements).toBe(true);
  });

  it('no refinements <=> hasRefinements = false', () => {
    // test if the values sent to the rendering function
    // are consistent with the search state

    const helper = jsHelper({});
    helper.search = sinon.stub();

    const container = document.createElement('div');
    const rendering = sinon.stub();
    const makeWidget = connectClearAll(rendering);
    const widget = makeWidget({
      container,
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

  it('some refinements from results <=> hasRefinements = true', () => {
    // test if the values sent to the rendering function
    // are consistent with the search state
    const helper = jsHelper({}, undefined, {facets: ['aFacet']});
    helper.toggleRefinement('aFacet', 'some value');
    helper.search = sinon.stub();

    const container = document.createElement('div');
    const rendering = sinon.stub();
    const makeWidget = connectClearAll(rendering);
    const widget = makeWidget({
      container,
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

    expect(rendering.lastCall.args[0].hasRefinements).toBe(true);
  });
});
