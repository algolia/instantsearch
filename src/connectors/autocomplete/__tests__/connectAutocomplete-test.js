import algoliasearchHelper, { SearchResults } from 'algoliasearch-helper';
import connectAutocomplete from '../connectAutocomplete';
import { TAG_PLACEHOLDER } from '../../../lib/escape-highlight';

const fakeClient = { addAlgoliaAgent: () => {} };

describe('connectAutocomplete', () => {
  it('throws without render function', () => {
    expect(() => {
      connectAutocomplete();
    }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (got type \\"undefined\\").

See documentation: https://www.algolia.com/doc/api-reference/widgets/autocomplete/js/#connector"
`);
  });

  it('renders during init and render', () => {
    const renderFn = jest.fn();
    const makeWidget = connectAutocomplete(renderFn);
    const widget = makeWidget();

    expect(renderFn).toHaveBeenCalledTimes(0);

    const helper = algoliasearchHelper(fakeClient, '', {});
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

  it('creates DerivedHelper', () => {
    const renderFn = jest.fn();
    const makeWidget = connectAutocomplete(renderFn);
    const widget = makeWidget({ indices: [{ label: 'foo', value: 'foo' }] });

    const helper = algoliasearchHelper(fakeClient, '', {});
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

    const helper = algoliasearchHelper(fakeClient, '', {});
    helper.search = jest.fn();

    widget.init({ helper, instantSearchInstance: {} });

    const { refine } = renderFn.mock.calls[0][0];
    refine('foo');

    expect(refine).toBe(widget._refine);
    expect(helper.search).toHaveBeenCalledTimes(1);
    expect(helper.state.query).toBe('foo');
  });

  it('with escapeHTML should escape the hits', () => {
    const renderFn = jest.fn();
    const makeWidget = connectAutocomplete(renderFn);
    const widget = makeWidget({ escapeHTML: true });

    const helper = algoliasearchHelper(fakeClient, '', {});
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

    const helper = algoliasearchHelper(fakeClient, '', {});
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

  describe('dispose', () => {
    it('calls the unmount function', () => {
      const helper = algoliasearchHelper(fakeClient, 'firstIndex');

      const renderFn = () => {};
      const unmountFn = jest.fn();
      const makeWidget = connectAutocomplete(renderFn, unmountFn);
      const widget = makeWidget();

      widget.init({ helper, instantSearchInstance: {} });

      expect(unmountFn).toHaveBeenCalledTimes(0);

      widget.dispose({ helper, state: helper.state });

      expect(unmountFn).toHaveBeenCalledTimes(1);
    });

    it('does not throw without the unmount function', () => {
      const helper = algoliasearchHelper(fakeClient, 'firstIndex');

      const renderFn = () => {};
      const makeWidget = connectAutocomplete(renderFn);
      const widget = makeWidget();

      widget.init({ helper, instantSearchInstance: {} });

      expect(() =>
        widget.dispose({ helper, state: helper.state })
      ).not.toThrow();
    });

    it('removes the created DerivedHelper', () => {
      const detachDerivedHelper = jest.fn();
      const helper = algoliasearchHelper(fakeClient, 'firstIndex');
      helper.detachDerivedHelper = detachDerivedHelper;

      const renderFn = () => {};
      const makeWidget = connectAutocomplete(renderFn);
      const widget = makeWidget({
        indices: [
          { label: 'Second', value: 'secondIndex' },
          { label: 'Third', value: 'thirdIndex' },
        ],
      });

      widget.init({ helper, instantSearchInstance: {} });

      expect(detachDerivedHelper).toHaveBeenCalledTimes(0);

      widget.dispose({ helper, state: helper.state });

      expect(detachDerivedHelper).toHaveBeenCalledTimes(2);
    });

    it('removes only the DerivedHelper created by autocomplete', () => {
      const detachDerivedHelper = jest.fn();
      const helper = algoliasearchHelper(fakeClient, 'firstIndex');
      helper.detachDerivedHelper = detachDerivedHelper;

      const renderFn = () => {};
      const makeWidget = connectAutocomplete(renderFn);
      const widget = makeWidget({
        indices: [
          { label: 'Second', value: 'secondIndex' },
          { label: 'Third', value: 'thirdIndex' },
        ],
      });

      const derivedHelperOne = helper.derive(state => state);
      const derivedHelperTwo = helper.derive(state => state);

      widget.init({ helper, instantSearchInstance: {} });

      expect(detachDerivedHelper).toHaveBeenCalledTimes(0);

      widget.dispose({ helper, state: helper.state });

      expect(detachDerivedHelper).toHaveBeenCalledTimes(2);
      expect(helper.derivedHelpers).toEqual(
        expect.arrayContaining([derivedHelperOne, derivedHelperTwo])
      );
    });

    it('removes the `query` from the `SearchParameters`', () => {
      const helper = algoliasearchHelper(fakeClient, 'firstIndex', {
        query: 'Apple',
      });

      const renderFn = () => {};
      const makeWidget = connectAutocomplete(renderFn);
      const widget = makeWidget();

      widget.init({ helper, instantSearchInstance: {} });

      expect(helper.state.query).toBe('Apple');

      const nextState = widget.dispose({ helper, state: helper.state });

      expect(nextState.query).toBeUndefined();
    });

    it('removes the TAG_PLACEHOLDER from the `SearchParameters`', () => {
      const helper = algoliasearchHelper(fakeClient, 'firstIndex', {
        ...TAG_PLACEHOLDER,
      });

      const renderFn = () => {};
      const makeWidget = connectAutocomplete(renderFn);
      const widget = makeWidget();

      expect(helper.state.highlightPreTag).toBe(
        TAG_PLACEHOLDER.highlightPreTag
      );

      expect(helper.state.highlightPostTag).toBe(
        TAG_PLACEHOLDER.highlightPostTag
      );

      widget.init({ helper, instantSearchInstance: {} });

      const nextState = widget.dispose({ helper, state: helper.state });

      expect(nextState.highlightPreTag).toBeUndefined();
      expect(nextState.highlightPostTag).toBeUndefined();
    });

    it('does not remove the TAG_PLACEHOLDER from the `SearchParameters` with `escapeHTML`', () => {
      const helper = algoliasearchHelper(fakeClient, 'firstIndex', {
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
      });

      const renderFn = () => {};
      const makeWidget = connectAutocomplete(renderFn);
      const widget = makeWidget({
        escapeHTML: false,
      });

      expect(helper.state.highlightPreTag).toBe('<mark>');
      expect(helper.state.highlightPostTag).toBe('</mark>');

      widget.init({ helper, instantSearchInstance: {} });

      const nextState = widget.dispose({ helper, state: helper.state });

      expect(nextState.highlightPreTag).toBe('<mark>');
      expect(nextState.highlightPostTag).toBe('</mark>');
    });
  });
});
