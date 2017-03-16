

import sinon from 'sinon';

import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;

import connectRangeSlider from '../connectRangeSlider.js';

const fakeClient = {addAlgoliaAgent: () => {}};

describe('connectRangeSlider', () => {
  it('Renders during init and render', () => {
    const container = document.createElement('div');
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectRangeSlider(rendering);

    const attributeName = 'price';
    const widget = makeWidget({
      container,
      attributeName,
    });

    const config = widget.getConfiguration();
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
      const {range, collapsible, start,
        shouldAutoHideContainer, containerNode} = rendering.lastCall.args[0];
      expect(range).toEqual({min: 0, max: 0});
      expect(start).toEqual([-Infinity, Infinity]);
      expect(collapsible).toBe(false);
      expect(shouldAutoHideContainer).toBe(true);
      expect(containerNode).toBe(container);
    }

    widget.render({
      results: new SearchResults(helper.state, [{
        hits: [{test: 'oneTime'}],
        facets: {price: {10: 1, 20: 1, 30: 1}},
        facets_stats: { // eslint-disable-line 
          price: {
            avg: 20,
            max: 30,
            min: 10,
            sum: 60,
          },
        },
        nbHits: 1,
        nbPages: 1,
        page: 0,
      }]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    { // Should call the rendering a second time, with isFirstRendering to false
      expect(rendering.callCount).toBe(2);
      const isFirstRendering = rendering.lastCall.args[1];
      expect(isFirstRendering).toBe(false);

      // should provide good values for the first rendering
      const {range, collapsible, start,
        shouldAutoHideContainer, containerNode} = rendering.lastCall.args[0];
      expect(range).toEqual({min: 10, max: 30});
      expect(start).toEqual([-Infinity, Infinity]);
      expect(collapsible).toBe(false);
      expect(shouldAutoHideContainer).toBe(false);
      expect(containerNode).toBe(container);
    }
  });

  it('Accepts some user bounds', () => {
    const container = document.createElement('div');
    const makeWidget = connectRangeSlider(() => {});

    const attributeName = 'price';

    expect(makeWidget({container, attributeName, min: 0}).getConfiguration()).toEqual({
      disjunctiveFacets: [attributeName],
      numericRefinements: {
        [attributeName]: {'>=': [0]},
      },
    });

    expect(makeWidget({container, attributeName, max: 100}).getConfiguration()).toEqual({
      disjunctiveFacets: [attributeName],
      numericRefinements: {
        [attributeName]: {'<=': [100]},
      },
    });

    expect(makeWidget({container, attributeName, min: 0, max: 100}).getConfiguration()).toEqual({
      disjunctiveFacets: [attributeName],
      numericRefinements: {
        [attributeName]: {
          '>=': [0],
          '<=': [100],
        },
      },
    });
  });

  it('Provides a function to update the refinements at each step', () => {
    const container = document.createElement('div');

    const rendering = sinon.stub();
    const makeWidget = connectRangeSlider(rendering);

    const attributeName = 'price';
    const widget = makeWidget({
      container,
      attributeName,
    });

    const helper = jsHelper(fakeClient, '', widget.getConfiguration());
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    { // first rendering
      expect(helper.getNumericRefinement('price', '>=')).toEqual(undefined);
      expect(helper.getNumericRefinement('price', '<=')).toEqual(undefined);
      const renderOptions = rendering.lastCall.args[0];
      const {refine} = renderOptions;
      refine([10, 30]);
      expect(helper.getNumericRefinement('price', '>=')).toEqual([10]);
      expect(helper.getNumericRefinement('price', '<=')).toEqual([30]);
      expect(helper.search.callCount).toBe(1);
    }

    widget.render({
      results: new SearchResults(helper.state, [{
        hits: [{test: 'oneTime'}],
        facets: {price: {10: 1, 20: 1, 30: 1}},
        facets_stats: { // eslint-disable-line 
          price: {
            avg: 20,
            max: 30,
            min: 10,
            sum: 60,
          },
        },
        nbHits: 1,
        nbPages: 1,
        page: 0,
      }, {}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    { // Second rendering
      expect(helper.getNumericRefinement('price', '>=')).toEqual([10]);
      expect(helper.getNumericRefinement('price', '<=')).toEqual([30]);
      const renderOptions = rendering.lastCall.args[0];
      const {refine} = renderOptions;
      refine([23, 27]);
      expect(helper.getNumericRefinement('price', '>=')).toEqual([23]);
      expect(helper.getNumericRefinement('price', '<=')).toEqual([27]);
      expect(helper.search.callCount).toBe(2);
    }
  });
});
