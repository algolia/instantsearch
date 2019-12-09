import algoliasearchHelper, {
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';
import { TAG_PLACEHOLDER } from '../../../lib/escape-highlight';
import connectHits from '../connectHits';

jest.mock('../../../lib/utils/hits-absolute-position', () => ({
  // The real implementation creates a new array instance, which can cause bugs,
  // especially with the __escaped mark, we thus make sure the mock also has the
  // same behavior regarding the array.
  addAbsolutePosition: hits => hits.map(x => x),
}));

describe('connectHits', () => {
  it('throws without render function', () => {
    expect(() => {
      connectHits()({});
    }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (received type Undefined).

See documentation: https://www.algolia.com/doc/api-reference/widgets/hits/js/#connector"
`);
  });

  it('is a widget', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customHits = connectHits(render, unmount);
    const widget = customHits({});

    expect(widget).toEqual(
      expect.objectContaining({
        $$type: 'ais.hits',
        init: expect.any(Function),
        render: expect.any(Function),
        dispose: expect.any(Function),
      })
    );
  });

  it('Renders during init and render', () => {
    const renderFn = jest.fn();
    const makeWidget = connectHits(renderFn);
    const widget = makeWidget({ escapeHTML: true });

    // test if widget is not rendered yet at this point
    expect(renderFn).toHaveBeenCalledTimes(0);

    const helper = algoliasearchHelper({}, '', {});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    expect(renderFn).toHaveBeenCalledTimes(1);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({ widgetParams: { escapeHTML: true } }),
      true
    );

    widget.render({
      results: new SearchResults(helper.state, [{ hits: [] }]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(renderFn).toHaveBeenCalledTimes(2);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({ widgetParams: { escapeHTML: true } }),
      false
    );
  });

  it('Provides the hits and the whole results', () => {
    const renderFn = jest.fn();
    const makeWidget = connectHits(renderFn);
    const widget = makeWidget({});

    const helper = algoliasearchHelper({}, '', {});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        hits: [],
        results: undefined,
      }),
      expect.anything()
    );

    const hits = [{ fake: 'data' }, { sample: 'infos' }];
    hits.__escaped = true;

    const results = new SearchResults(helper.state, [
      { hits: [].concat(hits) },
    ]);
    widget.render({
      results,
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        hits,
        results,
      }),
      expect.anything()
    );
  });

  it('escape highlight properties if requested', () => {
    const renderFn = jest.fn();
    const makeWidget = connectHits(renderFn);
    const widget = makeWidget({ escapeHTML: true });

    const helper = algoliasearchHelper({}, '', {});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        hits: [],
        results: undefined,
      }),
      expect.anything()
    );

    const hits = [
      {
        _highlightResult: {
          foobar: {
            value: `<script>${TAG_PLACEHOLDER.highlightPreTag}foobar${TAG_PLACEHOLDER.highlightPostTag}</script>`,
          },
        },
      },
    ];

    const results = new SearchResults(helper.state, [{ hits }]);
    widget.render({
      results,
      state: helper.state,
      helper,
      createURL: () => '#',
    });

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

    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        hits: escapedHits,
        results,
      }),
      expect.anything()
    );
  });

  it('transform items if requested', () => {
    const renderFn = jest.fn();
    const makeWidget = connectHits(renderFn);
    const widget = makeWidget({
      transformItems: items => items.map(() => ({ name: 'transformed' })),
    });

    const helper = algoliasearchHelper({}, '', {});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    expect(renderFn).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ hits: [], results: undefined }),
      expect.anything()
    );

    const hits = [{ name: 'name 1' }, { name: 'name 2' }];

    const results = new SearchResults(helper.state, [{ hits }]);
    widget.render({
      results,
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const expectedHits = [{ name: 'transformed' }, { name: 'transformed' }];
    expectedHits.__escaped = true;

    expect(renderFn).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        hits: expectedHits,
        results,
      }),
      expect.anything()
    );
  });

  it('adds queryID if provided to results', () => {
    const renderFn = jest.fn();
    const makeWidget = connectHits(renderFn);
    const widget = makeWidget({});

    const helper = algoliasearchHelper({}, '', {});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    const hits = [{ name: 'name 1' }, { name: 'name 2' }];

    const results = new SearchResults(helper.state, [
      { hits, queryID: 'theQueryID' },
    ]);
    widget.render({
      results,
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const expectedHits = [
      { name: 'name 1', __queryID: 'theQueryID' },
      { name: 'name 2', __queryID: 'theQueryID' },
    ];
    expectedHits.__escaped = true;

    expect(renderFn).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        hits: expectedHits,
      }),
      expect.anything()
    );
  });

  it('transform items after escaping', () => {
    const renderFn = jest.fn();
    const makeWidget = connectHits(renderFn);
    const widget = makeWidget({
      transformItems: items =>
        items.map(item => ({
          ...item,
          _highlightResult: {
            name: {
              value: item._highlightResult.name.value.toUpperCase(),
            },
          },
        })),
      escapeHTML: true,
    });

    const helper = algoliasearchHelper({}, '', {});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    const hits = [
      {
        name: 'hello',
        _highlightResult: {
          name: {
            value: `he${TAG_PLACEHOLDER.highlightPreTag}llo${TAG_PLACEHOLDER.highlightPostTag}`,
          },
        },
      },
      {
        name: 'halloween',
        _highlightResult: {
          name: {
            value: `ha${TAG_PLACEHOLDER.highlightPreTag}llo${TAG_PLACEHOLDER.highlightPostTag}ween`,
          },
        },
      },
    ];

    const results = new SearchResults(helper.state, [{ hits }]);
    widget.render({
      results,
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const expectedHits = [
      {
        name: 'hello',
        _highlightResult: {
          name: {
            value: 'HE<MARK>LLO</MARK>',
          },
        },
      },
      {
        name: 'halloween',
        _highlightResult: {
          name: {
            value: 'HA<MARK>LLO</MARK>WEEN',
          },
        },
      },
    ];

    expectedHits.__escaped = true;

    expect(renderFn).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        hits: expectedHits,
        results,
      }),
      expect.anything()
    );
  });

  it('keeps the __escaped mark', () => {
    const rendering = jest.fn();
    const makeWidget = connectHits(rendering);
    const widget = makeWidget({});

    const helper = algoliasearchHelper({}, '', {});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const results = new SearchResults(helper.state, [
      { hits: [{ whatever: 'i like kittens' }] },
    ]);
    widget.render({
      results,
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(results.hits.__escaped).toBe(true);
  });

  describe('getWidgetSearchParameters', () => {
    it('adds the TAG_PLACEHOLDER to the `SearchParameters`', () => {
      const render = () => {};
      const makeWidget = connectHits(render);
      const widget = makeWidget();

      const actual = widget.getWidgetSearchParameters(new SearchParameters());

      expect(actual).toEqual(new SearchParameters(TAG_PLACEHOLDER));
    });

    it('does not add the TAG_PLACEHOLDER to the `SearchParameters` with `escapeHTML` disabled', () => {
      const render = () => {};
      const makeWidget = connectHits(render);
      const widget = makeWidget({
        escapeHTML: false,
      });

      const actual = widget.getWidgetSearchParameters(new SearchParameters());

      expect(actual).toEqual(new SearchParameters());
    });
  });

  describe('dispose', () => {
    it('calls the unmount function', () => {
      const helper = algoliasearchHelper({}, '');

      const renderFn = () => {};
      const unmountFn = jest.fn();
      const makeWidget = connectHits(renderFn, unmountFn);
      const widget = makeWidget();

      expect(unmountFn).toHaveBeenCalledTimes(0);

      widget.dispose({ helper, state: helper.state });

      expect(unmountFn).toHaveBeenCalledTimes(1);
    });

    it('does not throw without the unmount function', () => {
      const helper = algoliasearchHelper({}, '');

      const renderFn = () => {};
      const makeWidget = connectHits(renderFn);
      const widget = makeWidget();

      expect(() =>
        widget.dispose({ helper, state: helper.state })
      ).not.toThrow();
    });

    it('removes the TAG_PLACEHOLDER from the `SearchParameters`', () => {
      const helper = algoliasearchHelper({}, '', {
        ...TAG_PLACEHOLDER,
      });

      const renderFn = () => {};
      const makeWidget = connectHits(renderFn);
      const widget = makeWidget();

      expect(helper.state.highlightPreTag).toBe(
        TAG_PLACEHOLDER.highlightPreTag
      );

      expect(helper.state.highlightPostTag).toBe(
        TAG_PLACEHOLDER.highlightPostTag
      );

      const nextState = widget.dispose({ helper, state: helper.state });

      expect(nextState.highlightPreTag).toBeUndefined();
      expect(nextState.highlightPostTag).toBeUndefined();
    });

    it('does not remove the TAG_PLACEHOLDER from the `SearchParameters` with `escapeHTML` disabled', () => {
      const helper = algoliasearchHelper({}, '', {
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
      });

      const renderFn = () => {};
      const makeWidget = connectHits(renderFn);
      const widget = makeWidget({
        escapeHTML: false,
      });

      expect(helper.state.highlightPreTag).toBe('<mark>');
      expect(helper.state.highlightPostTag).toBe('</mark>');

      const nextState = widget.dispose({ helper, state: helper.state });

      expect(nextState.highlightPreTag).toBe('<mark>');
      expect(nextState.highlightPostTag).toBe('</mark>');
    });
  });
});
