

import sinon from 'sinon';

import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;

import connectMenu from '../connectMenu.js';

const fakeClient = {addAlgoliaAgent: () => {}};

describe('connectMenu', () => {
  it('Renders during init and render', () => {
    const container = document.createElement('div');
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectMenu(rendering);
    const widget = makeWidget({
      container,
      attributeName: 'myFacet',
      limit: 9,
    });

    const config = widget.getConfiguration({});
    expect(config).toEqual({
      hierarchicalFacets: [{
        name: 'myFacet',
        attributes: ['myFacet'],
      }],
      maxValuesPerFacet: 9,
    });

    // test if widget is not rendered yet at this point
    expect(rendering.callCount).toBe(0);

    const helper = jsHelper(fakeClient, '', config);
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
    expect(firstRenderingOptions.shouldAutoHideContainer).toBe(true);
    expect(firstRenderingOptions.limitMax).toBe(9);
    expect(firstRenderingOptions.limitMin).toBe(9);
    expect(firstRenderingOptions.collapsible).toBe(false);
    expect(firstRenderingOptions.containerNode).toBe(container);

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
    expect(secondRenderingOptions.shouldAutoHideContainer).toBe(true);
    expect(secondRenderingOptions.limitMax).toBe(9);
    expect(secondRenderingOptions.limitMin).toBe(9);
    expect(secondRenderingOptions.collapsible).toBe(false);
    expect(secondRenderingOptions.containerNode).toBe(container);
  });

  it('Provide a function to clear the refinements at each step', () => {
    const container = document.createElement('div');
    const rendering = sinon.stub();
    const makeWidget = connectMenu(rendering);
    const widget = makeWidget({
      container,
      attributeName: 'category',
    });

    const helper = jsHelper(fakeClient, '', widget.getConfiguration({}));
    helper.search = sinon.stub();

    helper.toggleRefinement('category', 'value');

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.lastCall.args[0];
    const {toggleRefinement} = firstRenderingOptions;
    toggleRefinement('value');
    expect(helper.hasRefinements('category')).toBe(false);
    toggleRefinement('value');
    expect(helper.hasRefinements('category')).toBe(true);

    widget.render({
      results: new SearchResults(helper.state, [{}, {}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.lastCall.args[0];
    const {toggleRefinement: renderToggleRefinement} = secondRenderingOptions;
    renderToggleRefinement('value');
    expect(helper.hasRefinements('category')).toBe(false);
    renderToggleRefinement('value');
    expect(helper.hasRefinements('category')).toBe(true);
  });

  it('provides the correct facet values', () => {
    const container = document.createElement('div');
    const rendering = sinon.stub();
    const makeWidget = connectMenu(rendering);
    const widget = makeWidget({
      container,
      attributeName: 'category',
    });

    const helper = jsHelper(fakeClient, '', widget.getConfiguration({}));
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
    expect(firstRenderingOptions.facetValues).toEqual([]);

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
    expect(secondRenderingOptions.facetValues).toEqual([
      {
        name: 'Decoration',
        path: 'Decoration',
        count: 880,
        isRefined: true,
        data: null,
        url: '#',
      },
      {
        name: 'Outdoor',
        path: 'Outdoor',
        count: 47,
        isRefined: false,
        data: null,
        url: '#',
      },
    ]);
  });
});
