import jsHelper from 'algoliasearch-helper';

import connectMultiIndexResults from '../connectMultiIndexResults';

const fakeClient = { addAlgoliaAgent: () => {} };

describe('connectMultiIndexResults', () => {
  it('renders during init and render', () => {
    const rendering = jest.fn();
    const makeWidget = connectMultiIndexResults(rendering);
    const widget = makeWidget({ indices: [{ label: 'foo', value: 'foo' }] });

    expect(rendering).toHaveBeenCalledTimes(0);

    const helper = jsHelper(fakeClient, '', {});
    helper.search = jest.fn();

    widget.init({
      helper,
      instantSearchInstance: {},
    });

    // test render() called during init() and with `isFirstRendering = true`
    expect(rendering).toHaveBeenCalledTimes(1);
    expect(rendering.mock.calls[0][1]).toBeTruthy();

    widget.render({
      widgetParams: {},
      indices: widget.indices,
      instantSearchInstance: widget.instantSearchInstance,
    });

    // render() called with `isFirstRendering = false`
    expect(rendering).toHaveBeenCalledTimes(2);
    expect(rendering.mock.calls[1][1]).toBeFalsy();
  });

  it('creates multiple derived helper', () => {
    const rendering = jest.fn();
    const makeWidget = connectMultiIndexResults(rendering);
    const widget = makeWidget({ indices: [{ label: 'foo', value: 'foo' }] });

    const helper = jsHelper(fakeClient, '', {});
    helper.search = jest.fn();

    widget.init({ helper, instantSearchInstance: {} });

    // original helper + derived one
    expect(widget.indices.length).toBe(2);
  });
});
