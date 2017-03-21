
import sinon from 'sinon';

import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;

import connectSortBySelector from '../connectSortBySelector.js';

const fakeClient = {addAlgoliaAgent: () => {}};

describe('connectSortBySelector', () => {
  it('Renders during init and render', () => {
    const container = document.createElement('div');
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectSortBySelector(rendering);

    const indices = [
      {label: 'Sort products by relevance', name: 'relevance'},
      {label: 'Sort products by price', name: 'priceASC'},
    ];
    const widget = makeWidget({
      container,
      indices,
    });

    expect(widget.getConfiguration).toBe(undefined);

    const helper = jsHelper(fakeClient, indices[0].name);
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
      const {currentValue, options} = rendering.lastCall.args[0];
      expect(currentValue).toBe(helper.state.index);
      expect(options).toEqual([
        {label: 'Sort products by relevance', value: 'relevance'},
        {label: 'Sort products by price', value: 'priceASC'},
      ]);
    }

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    { // Should call the rendering a second time, with isFirstRendering to false
      expect(rendering.callCount).toBe(2);
      const isFirstRendering = rendering.lastCall.args[1];
      expect(isFirstRendering).toBe(false);

      // should provide good values after the first search
      const {currentValue, options} = rendering.lastCall.args[0];
      expect(currentValue).toBe(helper.state.index);
      expect(options).toEqual([
        {label: 'Sort products by relevance', value: 'relevance'},
        {label: 'Sort products by price', value: 'priceASC'},
      ]);
    }
  });

  it('Provides a function to update the index at each step', () => {
    const container = document.createElement('div');
    const rendering = sinon.stub();
    const makeWidget = connectSortBySelector(rendering);

    const indices = [
      {label: 'Sort products by relevance', name: 'relevance'},
      {label: 'Sort products by price', name: 'priceASC'},
    ];
    const widget = makeWidget({
      container,
      indices,
    });

    const helper = jsHelper(fakeClient, indices[0].name);
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    { // first rendering
      expect(helper.state.index).toBe(indices[0].name);
      const renderOptions = rendering.lastCall.args[0];
      const {setValue, currentValue} = renderOptions;
      expect(currentValue).toBe(helper.state.index);
      setValue('bip');
      expect(helper.state.index).toBe('bip');
      expect(helper.search.callCount).toBe(1);
    }

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    { // Second rendering
      expect(helper.state.index).toBe('bip');
      const renderOptions = rendering.lastCall.args[0];
      const {setValue, currentValue} = renderOptions;
      expect(currentValue).toBe('bip');
      setValue('bop');
      expect(helper.state.index).toBe('bop');
      expect(helper.search.callCount).toBe(2);
    }
  });
});
