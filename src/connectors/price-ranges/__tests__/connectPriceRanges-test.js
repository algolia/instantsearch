import sinon from 'sinon';

import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;

import connectPriceRanges from '../connectPriceRanges.js';

const fakeClient = {addAlgoliaAgent: () => {}};

describe('connectPriceRanges', () => {
  it('Renders during init and render', () => {
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectPriceRanges(rendering);

    const attributeName = 'price';
    const widget = makeWidget({
      attributeName,
    });

    // does not have a getConfiguration method
    const config = widget.getConfiguration();
    expect(config).toEqual({facets: [attributeName]});

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
      const {items} = rendering.lastCall.args[0];
      expect(items).toEqual([]);
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
      const {items, widgetParams} = rendering.lastCall.args[0];
      expect(items).toEqual([
        {to: 10, url: '#'}, {from: 10, to: 13, url: '#'}, {from: 13, to: 16, url: '#'},
        {from: 16, to: 19, url: '#'}, {from: 19, to: 22, url: '#'}, {from: 22, to: 25, url: '#'},
        {from: 25, to: 28, url: '#'}, {from: 28, url: '#'},
      ]);
      expect(widgetParams).toEqual({
        attributeName,
      });
    }
  });

  it('Provides a function to update the refinements at each step', () => {
    const rendering = sinon.stub();
    const makeWidget = connectPriceRanges(rendering);

    const attributeName = 'price';
    const widget = makeWidget({
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
      refine({from: 10, to: 30});
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
      }]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    { // Second rendering
      expect(helper.getNumericRefinement('price', '>=')).toEqual([10]);
      expect(helper.getNumericRefinement('price', '<=')).toEqual([30]);
      const renderOptions = rendering.lastCall.args[0];
      const {refine} = renderOptions;
      refine({from: 40, to: 50});
      expect(helper.getNumericRefinement('price', '>=')).toEqual([40]);
      expect(helper.getNumericRefinement('price', '<=')).toEqual([50]);
      expect(helper.search.callCount).toBe(2);
    }
  });
});
