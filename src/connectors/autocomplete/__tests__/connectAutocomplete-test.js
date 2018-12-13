import jsHelper, { SearchResults } from 'algoliasearch-helper';
import connectAutocomplete from '../connectAutocomplete.js';
import { TAG_PLACEHOLDER } from '../../../lib/escape-highlight.js';

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

  it('sets the default configuration', () => {
    const renderFn = jest.fn();
    const makeWidget = connectAutocomplete(renderFn);
    const widget = makeWidget();

    expect(widget.getConfiguration()).toEqual({
      highlightPreTag: TAG_PLACEHOLDER.highlightPreTag,
      highlightPostTag: TAG_PLACEHOLDER.highlightPostTag,
    });
  });

  it('creates derived helper', () => {
    const renderFn = jest.fn();
    const makeWidget = connectAutocomplete(renderFn);
    const widget = makeWidget({ indices: [{ label: 'foo', value: 'foo' }] });

    const helper = jsHelper(fakeClient, '', {});
    helper.search = jest.fn();

    widget.init({ helper, instantSearchInstance: {} });
    expect(renderFn).toHaveBeenCalledTimes(1);

    // original helper + derived one
    const renderOpts = renderFn.mock.calls[0][0];
    expect(renderOpts.indices).toHaveLength(2);
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

  it('with escapeHTML should escape the hits', () => {
    const renderFn = jest.fn();
    const makeWidget = connectAutocomplete(renderFn);
    const widget = makeWidget({ escapeHTML: true });

    const helper = jsHelper(fakeClient, '', {});
    helper.search = jest.fn();

    const hits = [
      {
        _highlightResult: {
          foobar: {
            value: `<script>${TAG_PLACEHOLDER.highlightPreTag}foobar${
              TAG_PLACEHOLDER.highlightPostTag
            }</script>`,
          },
        },
      },
    ];

    const escapedHits = [
      {
        _highlightResult: {
          foobar: {
            value: '&lt;script&gt;<mark>foobar</mark>&lt;/script&gt;',
          },
        },
      },
    ];

    escapedHits.__escaped = true;

    widget.init({ helper, instantSearchInstance: {} });
    const results = new SearchResults(helper.state, [{ hits }]);
    widget.render({
      results,
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const rendering = renderFn.mock.calls[1][0];

    expect(rendering.indices[0].hits).toEqual(escapedHits);
  });

  it('without escapeHTML should not escape the hits', () => {
    const renderFn = jest.fn();
    const makeWidget = connectAutocomplete(renderFn);
    const widget = makeWidget({ escapeHTML: false });

    const helper = jsHelper(fakeClient, '', {});
    helper.search = jest.fn();

    const hits = [
      {
        _highlightResult: {
          foobar: {
            value: `<script>${TAG_PLACEHOLDER.highlightPreTag}foobar${
              TAG_PLACEHOLDER.highlightPostTag
            }</script>`,
          },
        },
      },
    ];

    widget.init({ helper, instantSearchInstance: {} });
    const results = new SearchResults(helper.state, [{ hits }]);
    widget.render({
      results,
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const rendering = renderFn.mock.calls[1][0];

    expect(rendering.indices[0].hits).toEqual(hits);
  });
});
