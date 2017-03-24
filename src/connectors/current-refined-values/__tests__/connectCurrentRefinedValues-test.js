import sinon from 'sinon';
import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;
import connectCurrentRefinedValues from '../connectCurrentRefinedValues.js';

describe('connectCurrentRefinedValues', () => {
  it('Renders during init and render', () => {
    const helper = jsHelper({addAlgoliaAgent: () => {}});
    helper.search = sinon.stub();
    const container = document.createElement('div');
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectCurrentRefinedValues(rendering);
    const widget = makeWidget({
      container,
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
    expect(firstRenderingOptions.refinements).toEqual([]);
    expect(firstRenderingOptions.widgetParams).toEqual({
      container,
      foo: 'bar',
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
    expect(secondRenderingOptions.refinements).toEqual([]);
    expect(secondRenderingOptions.widgetParams).toEqual({
      container,
      foo: 'bar',
    });
  });

  it('Provide a function to clear the refinements at each step', () => {
    // For each refinements we get a function that we can call
    // for removing a single refinement
    const helper = jsHelper({addAlgoliaAgent: () => {}}, '', {
      facets: ['myFacet'],
    });
    helper.search = sinon.stub();
    const container = document.createElement('div');
    const rendering = sinon.stub();
    const makeWidget = connectCurrentRefinedValues(rendering);
    const widget = makeWidget({
      container,
    });

    helper.addFacetRefinement('myFacet', 'value');

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.lastCall.args[0];
    const clearFunctions = firstRenderingOptions.clearRefinementClicks;
    const refinements = firstRenderingOptions.refinements;
    expect(clearFunctions.length).toBe(1);
    expect(refinements.length).toBe(1);
    clearFunctions[0]();
    expect(helper.hasRefinements('myFacet')).toBe(false);

    helper.addFacetRefinement('myFacet', 'value');

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.lastCall.args[0];
    const otherClearFunctions = secondRenderingOptions.clearRefinementClicks;
    const otherRefinements = secondRenderingOptions.refinements;
    expect(otherClearFunctions.length).toBe(1);
    expect(otherRefinements.length).toBe(1);
    otherClearFunctions[0]();
    expect(helper.hasRefinements('myFacet')).toBe(false);
  });
});
