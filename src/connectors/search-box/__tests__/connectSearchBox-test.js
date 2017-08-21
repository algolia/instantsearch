import sinon from 'sinon';

import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;

import connectSearchBox from '../connectSearchBox.js';

const fakeClient = { addAlgoliaAgent: () => {} };

describe('connectSearchBox', () => {
  it('Renders during init and render', () => {
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectSearchBox(rendering);

    const widget = makeWidget({
      foo: 'bar', // dummy param passed to `renderFn`
    });

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
      const { query, widgetParams } = rendering.lastCall.args[0];
      expect(query).toBe(helper.state.query);
      expect(widgetParams).toEqual({ foo: 'bar' });
    }

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      // Should call the rendering a second time, with isFirstRendering to false
      expect(rendering.callCount).toBe(2);
      const isFirstRendering = rendering.lastCall.args[1];
      expect(isFirstRendering).toBe(false);

      // should provide good values after the first search
      const { query, widgetParams } = rendering.lastCall.args[0];
      expect(query).toBe(helper.state.query);
      expect(widgetParams).toEqual({ foo: 'bar' });
    }
  });

  it('Provides a function to update the refinements at each step', () => {
    const rendering = sinon.stub();
    const makeWidget = connectSearchBox(rendering);

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
      expect(helper.state.query).toBe('');
      const renderOptions = rendering.lastCall.args[0];
      const { refine } = renderOptions;
      refine('bip');
      expect(helper.state.query).toBe('bip');
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
      expect(helper.state.query).toBe('bip');
      const renderOptions = rendering.lastCall.args[0];
      const { refine, query } = renderOptions;
      expect(query).toBe('bip');
      refine('bop');
      expect(helper.state.query).toBe('bop');
      expect(helper.search.callCount).toBe(2);
    }
  });

  it('provides a function to clear the query and perform new search', () => {
    const rendering = sinon.stub();
    const makeWidget = connectSearchBox(rendering);

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
      expect(helper.state.query).toBe('');
      const renderOptions = rendering.lastCall.args[0];
      const { refine } = renderOptions;
      refine('bip');
      expect(helper.state.query).toBe('bip');
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
      expect(helper.state.query).toBe('bip');
      const renderOptions = rendering.lastCall.args[0];
      const { clear, query } = renderOptions;
      expect(query).toBe('bip');
      clear();
      expect(helper.state.query).toBe('');
      expect(helper.search.callCount).toBe(2);
    }
  });

  it('queryHook parameter let the dev control the behavior of the search', () => {
    const rendering = sinon.stub();
    const makeWidget = connectSearchBox(rendering);

    // letSearchThrough will control if the provided function should be called
    let letSearchThrough = false;
    const queryHook = sinon.spy((q, search) => {
      if (letSearchThrough) search(q);
    });

    const widget = makeWidget({
      queryHook,
    });

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

      refine('bip');
      expect(queryHook.callCount).toBe(1);
      expect(helper.state.query).toBe('');
      expect(helper.search.callCount).toBe(0);

      letSearchThrough = true;
      refine('bip');
      expect(queryHook.callCount).toBe(2);
      expect(helper.state.query).toBe('bip');
      expect(helper.search.callCount).toBe(1);
    }

    // reset the hook behavior
    letSearchThrough = false;

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

      refine('bop');
      expect(queryHook.callCount).toBe(3);
      expect(helper.state.query).toBe('bip');
      expect(helper.search.callCount).toBe(1);

      letSearchThrough = true;
      refine('bop');
      expect(queryHook.callCount).toBe(4);
      expect(helper.state.query).toBe('bop');
      expect(helper.search.callCount).toBe(2);
    }
  });

  it('should always provide the same refine() and clear() function reference', () => {
    const rendering = sinon.stub();
    const makeWidget = connectSearchBox(rendering);

    const widget = makeWidget();

    const helper = jsHelper(fakeClient);
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const firstRenderOptions = rendering.lastCall.args[0];

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderOptions = rendering.lastCall.args[0];

    expect(firstRenderOptions.clear).toBe(secondRenderOptions.clear);
    expect(firstRenderOptions.refine).toBe(secondRenderOptions.refine);
  });

  it('should clear on init as well', () => {
    const rendering = sinon.stub();
    const makeWidget = connectSearchBox(rendering);

    const widget = makeWidget();

    const helper = jsHelper(fakeClient);
    helper.search = sinon.stub();
    helper.setQuery('foobar');

    expect(helper.state.query).toBe('foobar');

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const renderingOptions = rendering.lastCall.args[0];
    renderingOptions.clear();

    expect(helper.state.query).toBe('');
    expect(helper.search.called).toBe(true);
  });
});
