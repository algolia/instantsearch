import sinon from 'sinon';

import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;

import connectPagination from '../connectPagination.js';

const fakeClient = { addAlgoliaAgent: () => {} };

describe('connectPagination', () => {
  it('connectPagination - Renders during init and render', () => {
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectPagination(rendering);
    const widget = makeWidget({
      foo: 'bar', // dummy param for `widgetParams` test
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

    {
      // should call the rendering once with isFirstRendering to true
      expect(rendering.callCount).toBe(1);
      const isFirstRendering = rendering.lastCall.args[1];
      expect(isFirstRendering).toBe(true);

      // should provide good values for the first rendering
      const firstRenderingOptions = rendering.lastCall.args[0];
      expect(firstRenderingOptions.currentRefinement).toBe(0);
      expect(firstRenderingOptions.nbHits).toBe(0);
      expect(firstRenderingOptions.nbPages).toBe(0);
      expect(firstRenderingOptions.widgetParams).toEqual({
        foo: 'bar',
      });
    }

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [{ test: 'oneTime' }],
          nbHits: 1,
          nbPages: 1,
          page: 0,
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      // Should call the rendering a second time, with isFirstRendering to false
      expect(rendering.callCount).toBe(2);
      const isFirstRendering = rendering.lastCall.args[1];
      expect(isFirstRendering).toBe(false);

      // should call the rendering with values from the results
      const secondRenderingOptions = rendering.lastCall.args[0];
      expect(secondRenderingOptions.currentRefinement).toBe(0);
      expect(secondRenderingOptions.nbHits).toBe(1);
      expect(secondRenderingOptions.nbPages).toBe(1);
    }
  });

  it('Provides a function to update the refinements at each step', () => {
    const rendering = sinon.stub();
    const makeWidget = connectPagination(rendering);

    const widget = makeWidget();

    const helper = jsHelper(fakeClient);
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    {
      // first rendering
      const renderOptions = rendering.lastCall.args[0];
      const { refine } = renderOptions;
      refine(2);
      expect(helper.getPage()).toBe(2);
      expect(helper.search.callCount).toBe(1);
    }

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      // Second rendering
      const renderOptions = rendering.lastCall.args[0];
      const { refine } = renderOptions;
      refine(7);
      expect(helper.getPage()).toBe(7);
      expect(helper.search.callCount).toBe(2);
    }
  });

  it('Provides the pages to render (default)', () => {
    const rendering = jest.fn();
    const makeWidget = connectPagination(rendering);

    const widget = makeWidget();

    const helper = jsHelper(fakeClient);
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    // page 0
    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { pages } = renderOptions;
      expect(pages).toEqual([0, 1, 2, 3, 4, 5, 6]);
    }

    // some random page
    helper.setPage(5);
    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { pages } = renderOptions;
      expect(pages).toEqual([2, 3, 4, 5, 6, 7, 8]);
    }

    // last pages
    helper.setPage(49);
    widget.render({
      results: new SearchResults(helper.state, [
        {
          nbPages: 50,
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { pages } = renderOptions;
      expect(pages).toEqual([43, 44, 45, 46, 47, 48, 49]);
    }
  });

  it('Provides the pages to render (extra padding)', () => {
    const rendering = jest.fn();
    const makeWidget = connectPagination(rendering);

    const widget = makeWidget({
      padding: 5,
    });

    const helper = jsHelper(fakeClient);
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    // page 0
    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { pages } = renderOptions;
      expect(pages).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    }

    // some random page
    helper.setPage(5);
    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { pages } = renderOptions;
      expect(pages).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    }

    // last pages
    helper.setPage(49);
    widget.render({
      results: new SearchResults(helper.state, [
        {
          nbPages: 50,
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { pages } = renderOptions;
      expect(pages).toEqual([39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49]);
    }
  });
});
