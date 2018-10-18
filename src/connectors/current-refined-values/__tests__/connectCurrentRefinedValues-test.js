import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;
import connectCurrentRefinedValues from '../connectCurrentRefinedValues.js';

describe('connectCurrentRefinedValues', () => {
  it('Renders during init and render', () => {
    const helper = jsHelper({});
    helper.search = () => {};
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = jest.fn();
    const makeWidget = connectCurrentRefinedValues(rendering);
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

  it('Renders transformed items during init and render', () => {
    const helper = jsHelper({}, '', {
      facets: ['myFacet'],
    });
    helper.search = () => {};
    const rendering = jest.fn();
    const makeWidget = connectCurrentRefinedValues(rendering);
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

  it('Provide a function to clear the refinement', () => {
    // For each refinements we get a function that we can call
    // for removing a single refinement
    const helper = jsHelper({}, '', {
      facets: ['myFacet'],
    });
    helper.search = () => {};
    const rendering = jest.fn();
    const makeWidget = connectCurrentRefinedValues(rendering);
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
    expect(refinements).toHaveLength(1);
    firstRenderingOptions.refine(refinements[0]);
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
    expect(otherRefinements).toHaveLength(1);
    secondRenderingOptions.refine(refinements[0]);
    expect(helper.hasRefinements('myFacet')).toBe(false);
  });

  it('should clear also the search query', () => {
    const helper = jsHelper({}, '', {
      facets: ['myFacet'],
    });
    helper.search = jest.fn();

    const rendering = jest.fn();
    const makeWidget = connectCurrentRefinedValues(rendering);
    const widget = makeWidget({ clearsQuery: true });

    helper.setQuery('foobar');
    helper.toggleRefinement('myFacet', 'value');
    expect(helper.state.query).toBe('foobar');

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    // clear current refined values + query
    expect(rendering).toBeCalled();
    expect(helper.hasRefinements('myFacet')).toBe(true);

    const [{ clearAllClick }] = rendering.mock.calls[0];
    clearAllClick();

    expect(helper.search).toBeCalled();
    expect(helper.state.query).toBe('');
    expect(helper.hasRefinements('myFacet')).toBe(false);
  });

  it('should provide the query as a refinement if clearsQuery is true', () => {
    const helper = jsHelper({}, '', {});
    helper.search = jest.fn();

    const rendering = jest.fn();
    const makeWidget = connectCurrentRefinedValues(rendering);
    const widget = makeWidget({ clearsQuery: true });

    helper.setQuery('foobar');

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.mock.calls[0][0];
    const refinements = firstRenderingOptions.refinements;
    expect(refinements).toHaveLength(1);
    const value = refinements[0];
    expect(value.type).toBe('query');
    expect(value.name).toBe('foobar');
    expect(value.query).toBe('foobar');
    const refine = firstRenderingOptions.refine;
    refine(value);
    expect(helper.state.query).toBe('');

    helper.setQuery('foobaz');

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.mock.calls[1][0];
    const secondRefinements = secondRenderingOptions.refinements;
    expect(secondRefinements).toHaveLength(1);
    const secondValue = secondRefinements[0];
    expect(secondValue.type).toBe('query');
    expect(secondValue.name).toBe('foobaz');
    expect(secondValue.query).toBe('foobaz');
    const secondRefine = secondRenderingOptions.refine;
    secondRefine(secondValue);
    expect(helper.state.query).toBe('');
  });

  it('should provide the query as a refinement if clearsQuery is true, onlyListedAttributes is true and `query` is a listed attribute', () => {
    const helper = jsHelper({}, '', {});

    const rendering = jest.fn();
    const makeWidget = connectCurrentRefinedValues(rendering);
    const widget = makeWidget({
      clearsQuery: true,
      onlyListedAttributes: true,
      attributes: [{ name: 'query' }],
    });

    helper.setQuery('foobar');

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.mock.calls[0][0];
    const refinements = firstRenderingOptions.refinements;
    expect(refinements).toHaveLength(1);
    const value = refinements[0];
    expect(value.type).toBe('query');
    expect(value.name).toBe('foobar');
    expect(value.query).toBe('foobar');
  });

  it('should not provide the query as a refinement if clearsQuery is true, onlyListedAttributes is true but query is not listed in attributes', () => {
    const helper = jsHelper({}, '', {});

    const rendering = jest.fn();
    const makeWidget = connectCurrentRefinedValues(rendering);
    const widget = makeWidget({
      clearsQuery: true,
      onlyListedAttributes: true,
      attributes: [{ name: 'brand' }],
    });

    helper.setQuery('foobar');

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.mock.calls[0][0];
    const refinements = firstRenderingOptions.refinements;
    expect(refinements).toHaveLength(0);
  });
});
