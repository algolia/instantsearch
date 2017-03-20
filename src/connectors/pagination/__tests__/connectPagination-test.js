

import sinon from 'sinon';

import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;

import connectPagination from '../connectPagination.js';

const fakeClient = {addAlgoliaAgent: () => {}};

describe('connectPagination', () => {
  it('connectPagination - Renders during init and render', () => {
    const container = document.createElement('div');
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectPagination(rendering);
    const widget = makeWidget({
      container,
    });

    // does not have a getConfiguration method
    expect(widget.getConfiguration).toBe(undefined);

    const helper = jsHelper(fakeClient);
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
      const firstRenderingOptions = rendering.lastCall.args[0];
      expect(firstRenderingOptions.currentPage).toBe(0);
      expect(firstRenderingOptions.nbHits).toBe(0);
      expect(firstRenderingOptions.nbPages).toBe(0);
      expect(firstRenderingOptions.shouldAutoHideContainer).toBe(true);
      expect(firstRenderingOptions.showFirstLast).toBe(true);
    }

    widget.render({
      results: new SearchResults(helper.state, [{
        hits: [{test: 'oneTime'}],
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

      // should call the rendering with values from the results
      const secondRenderingOptions = rendering.lastCall.args[0];
      expect(secondRenderingOptions.currentPage).toBe(0);
      expect(secondRenderingOptions.nbHits).toBe(1);
      expect(secondRenderingOptions.nbPages).toBe(1);
      expect(secondRenderingOptions.shouldAutoHideContainer).toBe(false);
      expect(secondRenderingOptions.showFirstLast).toBe(true);
    }
  });

  it('Provides a function to update the refinements at each step', () => {
    const container = document.createElement('div');
    const scrollTo = document.createElement('div');
    scrollTo.scrollIntoView = sinon.stub();

    const rendering = sinon.stub();
    const makeWidget = connectPagination(rendering);

    const widget = makeWidget({
      container,
      scrollTo,
    });

    const helper = jsHelper(fakeClient);
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    { // first rendering
      const renderOptions = rendering.lastCall.args[0];
      const {setPage} = renderOptions;
      setPage(2);
      expect(helper.getPage()).toBe(2);
      expect(helper.search.callCount).toBe(1);
      expect(scrollTo.scrollIntoView.callCount).toBe(1);
    }

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    { // Second rendering
      const renderOptions = rendering.lastCall.args[0];
      const {setPage} = renderOptions;
      setPage(7);
      expect(helper.getPage()).toBe(7);
      expect(helper.search.callCount).toBe(2);
      expect(scrollTo.scrollIntoView.callCount).toBe(2);
    }
  });
});
