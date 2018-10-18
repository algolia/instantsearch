import jsHelper, { SearchResults } from 'algoliasearch-helper';
import connectCurrentRefinements from '../connectCurrentRefinements.js';

describe('connectCurrentRefinements', () => {
  it('renders during init and render', () => {
    const helper = jsHelper({});
    helper.search = () => {};
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = jest.fn();
    const makeWidget = connectCurrentRefinements(rendering);
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
    expect(firstRenderingOptions.refinements).toEqual([]);
    expect(firstRenderingOptions.widgetParams).toEqual({
      foo: 'bar',
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

    const secondRenderingOptions = rendering.mock.calls[0][0];
    expect(secondRenderingOptions.refinements).toEqual([]);
    expect(secondRenderingOptions.widgetParams).toEqual({
      foo: 'bar',
    });
  });

  it('renders transformed items during init and render', () => {
    const helper = jsHelper({}, '', {
      facets: ['myFacet'],
    });
    helper.search = () => {};
    const rendering = jest.fn();
    const makeWidget = connectCurrentRefinements(rendering);
    const widget = makeWidget({
      transformItems: items =>
        items.map(item => ({ ...item, name: 'transformed' })),
    });

    helper.addFacetRefinement('myFacet', 'value');

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.refinements).toEqual([
      expect.objectContaining({ name: 'transformed' }),
    ]);

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.mock.calls[0][0];
    expect(secondRenderingOptions.refinements).toEqual([
      expect.objectContaining({ name: 'transformed' }),
    ]);
  });

  it('provides functions to clear refinement items', () => {
    // For each refinements we get a function that we can call
    // for removing a single refinement
    const helper = jsHelper({}, '', {
      facets: ['myFacet'],
    });
    helper.search = () => {};
    const rendering = jest.fn();
    const makeWidget = connectCurrentRefinements(rendering);
    const widget = makeWidget();

    helper.addFacetRefinement('myFacet', 'value');

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.mock.calls[0][0];
    const refinements = firstRenderingOptions.refinements;
    expect(typeof firstRenderingOptions.refine).toBe('function');
    expect(refinements[0].items).toHaveLength(1);
    firstRenderingOptions.refine(refinements[0].items[0]);
    expect(helper.hasRefinements('myFacet')).toBe(false);

    helper.addFacetRefinement('myFacet', 'value');

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.mock.calls[1][0];
    const otherRefinements = secondRenderingOptions.refinements;
    expect(typeof secondRenderingOptions.refine).toBe('function');
    expect(otherRefinements[0].items).toHaveLength(1);
    secondRenderingOptions.refine(otherRefinements[0].items[0]);
    expect(helper.hasRefinements('myFacet')).toBe(false);
  });
});
