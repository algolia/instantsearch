

import sinon from 'sinon';

import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;

import connectSearchBox from '../connectSearchBox.js';

const fakeClient = {addAlgoliaAgent: () => {}};

describe('connectSearchBox', () => {
  it('Renders during init and render', () => {
    const container = document.createElement('div');
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectSearchBox(rendering);

    const widget = makeWidget({
      container,
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

    { // should call the rendering once with isFirstRendering to true
      expect(rendering.callCount).toBe(1);
      const isFirstRendering = rendering.lastCall.args[1];
      expect(isFirstRendering).toBe(true);

      // should provide good values for the first rendering
      const {query, containerNode, poweredBy,
        autofocus, searchOnEnterKeyPressOnly, placeholder} = rendering.lastCall.args[0];
      expect(containerNode).toBe(container);
      expect(query).toBe(helper.state.query);
      expect(poweredBy).toBe(false);
      expect(autofocus).toBe('auto');
      expect(searchOnEnterKeyPressOnly).toBe(false);
      expect(placeholder).toBe('');
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
      const {query, containerNode, poweredBy,
        autofocus, searchOnEnterKeyPressOnly, placeholder} = rendering.lastCall.args[0];
      expect(containerNode).toBe(container);
      expect(query).toBe(helper.state.query);
      expect(poweredBy).toBe(false);
      expect(autofocus).toBe('auto');
      expect(searchOnEnterKeyPressOnly).toBe(false);
      expect(placeholder).toBe('');
    }
  });

  it('Provides a function to update the refinements at each step', () => {
    const container = document.createElement('div');
    const rendering = sinon.stub();
    const makeWidget = connectSearchBox(rendering);

    const widget = makeWidget({
      container,
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
      expect(helper.state.query).toBe('');
      const renderOptions = rendering.lastCall.args[0];
      const {search} = renderOptions;
      search('bip');
      expect(helper.state.query).toBe('bip');
      expect(helper.search.callCount).toBe(1);
    }

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    { // Second rendering
      expect(helper.state.query).toBe('bip');
      const renderOptions = rendering.lastCall.args[0];
      const {search, query} = renderOptions;
      expect(query).toBe('bip');
      search('bop');
      expect(helper.state.query).toBe('bop');
      expect(helper.search.callCount).toBe(2);
    }
  });

  it('queryHook parameter let the dev control the behavior of the search', () => {
    const container = document.createElement('div');
    const rendering = sinon.stub();
    const makeWidget = connectSearchBox(rendering);

    // letSearchThrough will control if the provided function should be called
    let letSearchThrough = false;
    const queryHook = sinon.spy((q, search) => { if (letSearchThrough) search(q); });

    const widget = makeWidget({
      container,
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

    { // first rendering
      const renderOptions = rendering.lastCall.args[0];
      const {search} = renderOptions;

      search('bip');
      expect(queryHook.callCount).toBe(1);
      expect(helper.state.query).toBe('');
      expect(helper.search.callCount).toBe(0);

      letSearchThrough = true;
      search('bip');
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

    { // Second rendering
      const renderOptions = rendering.lastCall.args[0];
      const {search} = renderOptions;

      search('bop');
      expect(queryHook.callCount).toBe(3);
      expect(helper.state.query).toBe('bip');
      expect(helper.search.callCount).toBe(1);

      letSearchThrough = true;
      search('bop');
      expect(queryHook.callCount).toBe(4);
      expect(helper.state.query).toBe('bop');
      expect(helper.search.callCount).toBe(2);
    }
  });
});
