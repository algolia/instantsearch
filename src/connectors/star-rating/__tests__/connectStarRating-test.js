/* eslint-env mocha */

import expect from 'expect';
import sinon from 'sinon';

import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;

import connectStarRating from '../connectStarRating.js';

const fakeClient = {addAlgoliaAgent: () => {}};

describe('connectStarRating', () => {
  it('Renders during init and render', () => {
    const container = document.createElement('div');
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectStarRating(rendering);

    const attributeName = 'grade';
    const widget = makeWidget({
      container,
      attributeName,
    });

    const config = widget.getConfiguration({});
    expect(config).toEqual({
      disjunctiveFacets: [attributeName],
    });

    const helper = jsHelper(fakeClient, '', config);
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    { // should call the rendering once with isFirstRendering to true
      expect(rendering.callCount).toBe(1);
      const isFirstRendering = rendering.lastCall.args[1];
      expect(isFirstRendering).toBe(true);

      // should provide good values for the first rendering
      const {containerNode, facetValues, collapsible, shouldAutoHideContainer} = rendering.lastCall.args[0];
      expect(containerNode).toBe(container);
      expect(facetValues).toEqual([]);
      expect(collapsible).toBe(false);
      expect(shouldAutoHideContainer).toBe(true);
    }

    widget.render({
      results: new SearchResults(helper.state, [{
        facets: {
          [attributeName]: {0: 5, 1: 10, 2: 20, 3: 50, 4: 900, 5: 100},
        },
      }, {}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    { // Should call the rendering a second time, with isFirstRendering to false
      expect(rendering.callCount).toBe(2);
      const isFirstRendering = rendering.lastCall.args[1];
      expect(isFirstRendering).toBe(false);

      // should provide good values after the first search
      const {containerNode, facetValues, collapsible, shouldAutoHideContainer} = rendering.lastCall.args[0];
      expect(containerNode).toBe(container);
      expect(facetValues).toEqual([
        {
          count: 1000, isRefined: false,
          labels: {andUp: '& Up'}, name: '4',
          stars: [true, true, true, true, false],
        },
        {
          count: 1050, isRefined: false,
          labels: {andUp: '& Up'}, name: '3',
          stars: [true, true, true, false, false],
        },
        {
          count: 1070, isRefined: false,
          labels: {andUp: '& Up'}, name: '2',
          stars: [true, true, false, false, false],
        },
        {
          count: 1080, isRefined: false,
          labels: {andUp: '& Up'}, name: '1',
          stars: [true, false, false, false, false],
        },
      ]);
      expect(collapsible).toBe(false);
      expect(shouldAutoHideContainer).toBe(false);
    }
  });

  it('Provides a function to update the index at each step', () => {
    const container = document.createElement('div');
    const rendering = sinon.stub();
    const makeWidget = connectStarRating(rendering);

    const attributeName = 'grade';
    const widget = makeWidget({
      container,
      attributeName,
    });

    const config = widget.getConfiguration({});

    const helper = jsHelper(fakeClient, '', config);
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    { // first rendering
      const renderOptions = rendering.lastCall.args[0];
      const {toggleRefinement, facetValues} = renderOptions;
      expect(facetValues).toEqual([]);
      expect(helper.getRefinements(attributeName)).toEqual([]);
      toggleRefinement('3');
      expect(helper.getRefinements(attributeName)).toEqual([
        {type: 'disjunctive', value: '3'},
        {type: 'disjunctive', value: '4'},
        {type: 'disjunctive', value: '5'},
      ]);
      expect(helper.search.callCount).toBe(1);
    }

    widget.render({
      results: new SearchResults(helper.state, [{
        facets: {
          [attributeName]: {3: 50, 4: 900, 5: 100},
        },
      }, {
        facets: {
          [attributeName]: {0: 5, 1: 10, 2: 20, 3: 50, 4: 900, 5: 100},
        },
      }]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    { // Second rendering
      const renderOptions = rendering.lastCall.args[0];
      const {toggleRefinement, facetValues} = renderOptions;
      expect(facetValues).toEqual([
        {
          count: 1000, isRefined: false,
          labels: {andUp: '& Up'}, name: '4',
          stars: [true, true, true, true, false],
        },
        {
          count: 1050, isRefined: true,
          labels: {andUp: '& Up'}, name: '3',
          stars: [true, true, true, false, false],
        },
        {
          count: 1070, isRefined: false,
          labels: {andUp: '& Up'}, name: '2',
          stars: [true, true, false, false, false],
        },
        {
          count: 1080, isRefined: false,
          labels: {andUp: '& Up'}, name: '1',
          stars: [true, false, false, false, false],
        },
      ]);
      expect(helper.getRefinements(attributeName)).toEqual([
        {type: 'disjunctive', value: '3'},
        {type: 'disjunctive', value: '4'},
        {type: 'disjunctive', value: '5'},
      ]);
      toggleRefinement('4');
      expect(helper.getRefinements(attributeName)).toEqual([
        {type: 'disjunctive', value: '4'},
        {type: 'disjunctive', value: '5'},
      ]);
      expect(helper.search.callCount).toBe(2);
    }
  });
});
