import jsHelper from 'algoliasearch-helper';
import connectAutocomplete from '../connectAutocomplete.js';

const fakeClient = { addAlgoliaAgent: () => {} };

describe('connectAutocomplete', () => {
  it('throws without `renderFn`', () => {
    expect(() => connectAutocomplete()).toThrow();
  });

  it('renders during init and render', () => {
    const renderFn = jest.fn();
    const makeWidget = connectAutocomplete(renderFn);
    const widget = makeWidget();

    expect(renderFn).toHaveBeenCalledTimes(0);

    const helper = jsHelper(fakeClient, '', {});
    helper.search = jest.fn();

    widget.init({
      helper,
      instantSearchInstance: {},
    });

    expect(renderFn).toHaveBeenCalledTimes(1);
    expect(renderFn.mock.calls[0][1]).toBeTruthy();

    widget.render({
      widgetParams: {},
      indices: widget.indices,
      instantSearchInstance: widget.instantSearchInstance,
    });

    expect(renderFn).toHaveBeenCalledTimes(2);
    expect(renderFn.mock.calls[1][1]).toBeFalsy();
  });

  it('creates derived helper', () => {
    const renderFn = jest.fn();
    const makeWidget = connectAutocomplete(renderFn);
    const widget = makeWidget({ indices: [{ label: 'foo', value: 'foo' }] });

    const helper = jsHelper(fakeClient, '', {});
    helper.search = jest.fn();

    widget.init({ helper, instantSearchInstance: {} });

    // original helper + derived one
    expect(widget.indices).toHaveLength(2);
  });

  it('set a query and trigger search on `refine`', () => {
    const renderFn = jest.fn();
    const makeWidget = connectAutocomplete(renderFn);
    const widget = makeWidget();

    const helper = jsHelper(fakeClient, '', {});
    helper.search = jest.fn();

    widget.init({ helper, instantSearchInstance: {} });

    const { refine } = renderFn.mock.calls[0][0];
    refine('foo');

    expect(refine).toBe(widget._refine);
    expect(helper.search).toHaveBeenCalledTimes(1);
    expect(helper.getState().query).toBe('foo');
  });
});
