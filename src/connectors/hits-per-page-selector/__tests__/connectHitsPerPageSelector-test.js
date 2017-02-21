/* eslint-env mocha */

import expect from 'expect';
import sinon from 'sinon';

import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;

import connectHitsPerPageSelector from '../connectHitsPerPageSelector.js';

const fakeClient = {addAlgoliaAgent: () => {}};

describe('connectHitsPerPageSelector', () => {
  it('Renders during init and render', () => {
    const container = document.createElement('div');
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectHitsPerPageSelector(rendering);
    const widget = makeWidget({
      container,
      options: [
        {value: 3, label: '3 items per page'},
        {value: 10, label: '10 items per page'},
      ],
    });

    expect(widget.getConfiguration).toEqual(undefined);

    // test if widget is not rendered yet at this point
    expect(rendering.callCount).toBe(0);

    const helper = jsHelper(fakeClient, '', {
      hitsPerPage: 3,
    });
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
    expect(firstRenderingOptions.containerNode).toBe(container);
    expect(firstRenderingOptions.shouldAutoHideContainer).toBe(false);

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
    expect(secondRenderingOptions.containerNode).toBe(container);
    expect(secondRenderingOptions.shouldAutoHideContainer).toBe(false);
  });

  it('Provide a function to change the current hits per page, and provide the current value', () => {
    const container = document.createElement('div');
    const rendering = sinon.stub();
    const makeWidget = connectHitsPerPageSelector(rendering);
    const widget = makeWidget({
      container,
      options: [
        {value: 3, label: '3 items per page'},
        {value: 10, label: '10 items per page'},
        {value: 11, label: ''},
      ],
    });

    const helper = jsHelper(fakeClient, '', {
      hitsPerPage: 11,
    });
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.lastCall.args[0];
    const {setValue} = firstRenderingOptions;
    expect(helper.getQueryParameter('hitsPerPage')).toBe(11);
    setValue(3);
    expect(helper.getQueryParameter('hitsPerPage')).toBe(3);

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.lastCall.args[0];
    const {setValue: renderSetValue} = secondRenderingOptions;
    expect(helper.getQueryParameter('hitsPerPage')).toBe(3);
    renderSetValue(10);
    expect(helper.getQueryParameter('hitsPerPage')).toBe(10);

    expect(helper.search.callCount).toBe(2);
  });

  it('provides the current hitsPerPage value', () => {
    const container = document.createElement('div');
    const rendering = sinon.stub();
    const makeWidget = connectHitsPerPageSelector(rendering);
    const widget = makeWidget({
      container,
      options: [
        {value: 3, label: '3 items per page'},
        {value: 10, label: '10 items per page'},
        {value: 7, label: ''},
      ],
    });

    const helper = jsHelper(fakeClient, '', {
      hitsPerPage: 7,
    });
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.lastCall.args[0];
    expect(firstRenderingOptions.currentValue).toBe(7);
    firstRenderingOptions.setValue(3);

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.lastCall.args[0];
    expect(secondRenderingOptions.currentValue).toBe(3);
  });

  it('adds an option for the unselecting values, when the current hitsPerPage is defined elsewhere', () => {
    const container = document.createElement('div');
    const rendering = sinon.stub();
    const makeWidget = connectHitsPerPageSelector(rendering);
    const widget = makeWidget({
      container,
      options: [
        {value: 3, label: '3 items per page'},
        {value: 10, label: '10 items per page'},
      ],
    });

    const helper = jsHelper(fakeClient, '', {
      hitsPerPage: 7,
    });
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.lastCall.args[0];
    expect(firstRenderingOptions.options.length).toBe(3);
    firstRenderingOptions.setValue(firstRenderingOptions.options[0].value);
    expect(helper.getQueryParameter('hitsPerPage')).toBe(undefined);

    // Reset the hitsPerPage to an actual value
    helper.setQueryParameter('hitsPerPage', 7);

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.lastCall.args[0];
    expect(secondRenderingOptions.options.length).toBe(3);
    secondRenderingOptions.setValue(secondRenderingOptions.options[0].value);
    expect(helper.getQueryParameter('hitsPerPage')).toBe(undefined);
  });
});
