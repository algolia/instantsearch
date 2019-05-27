import algoliasearchHelper, { SearchResults } from 'algoliasearch-helper';
import { TAG_PLACEHOLDER } from '../../../lib/escape-highlight';
import connectHits from '../connectHits';

jest.mock('../../../lib/utils/hits-absolute-position', () => ({
  addAbsolutePosition: hits => hits,
}));

describe('connectHits', () => {
  it('throws without render function', () => {
    expect(() => {
      connectHits()({});
    }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (got type \\"undefined\\").

See documentation: https://www.algolia.com/doc/api-reference/widgets/hits/js/#connector"
`);
  });

  it('Renders during init and render', () => {
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = jest.fn();
    const makeWidget = connectHits(rendering);
    const widget = makeWidget({ escapeHTML: true });

    expect(widget.getConfiguration()).toEqual({
      highlightPreTag: TAG_PLACEHOLDER.highlightPreTag,
      highlightPostTag: TAG_PLACEHOLDER.highlightPostTag,
    });

    // test if widget is not rendered yet at this point
    expect(rendering).toHaveBeenCalledTimes(0);

    const helper = algoliasearchHelper({}, '', {});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    expect(rendering).toHaveBeenCalledTimes(1);
    // test that rendering has been called during init with isFirstRendering = true
    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({ widgetParams: { escapeHTML: true } }),
      true
    );

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(rendering).toHaveBeenCalledTimes(2);
    // test that rendering has been called during init with isFirstRendering = false
    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({ widgetParams: { escapeHTML: true } }),
      false
    );
  });

  it('sets the default configuration', () => {
    const rendering = jest.fn();
    const makeWidget = connectHits(rendering);
    const widget = makeWidget();

    expect(widget.getConfiguration()).toEqual({
      highlightPreTag: TAG_PLACEHOLDER.highlightPreTag,
      highlightPostTag: TAG_PLACEHOLDER.highlightPostTag,
    });
  });

  it('Provides the hits and the whole results', () => {
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

    expect(rendering).toHaveBeenLastCalledWith(
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

    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        hits,
        results,
      }),
      expect.anything()
    );
  });

  it('escape highlight properties if requested', () => {
    const rendering = jest.fn();
    const makeWidget = connectHits(rendering);
    const widget = makeWidget({ escapeHTML: true });

    const helper = algoliasearchHelper({}, '', {});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    expect(rendering).toHaveBeenLastCalledWith(
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
            value: `<script>${TAG_PLACEHOLDER.highlightPreTag}foobar${
              TAG_PLACEHOLDER.highlightPostTag
            }</script>`,
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

    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        hits: escapedHits,
        results,
      }),
      expect.anything()
    );
  });

  it('transform items if requested', () => {
    const rendering = jest.fn();
    const makeWidget = connectHits(rendering);
    const widget = makeWidget({
      transformItems: items => items.map(() => ({ name: 'transformed' })),
    });

    const helper = algoliasearchHelper({}, '', {});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    expect(rendering).toHaveBeenNthCalledWith(
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

    expect(rendering).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        hits: [{ name: 'transformed' }, { name: 'transformed' }],
        results,
      }),
      expect.anything()
    );
  });

  it('adds queryID if provided to results', () => {
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

    expect(rendering).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        hits: [
          { name: 'name 1', __queryID: 'theQueryID' },
          { name: 'name 2', __queryID: 'theQueryID' },
        ],
      }),
      expect.anything()
    );
  });

  it('transform items after escaping', () => {
    const rendering = jest.fn();
    const makeWidget = connectHits(rendering);
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
            value: `he${TAG_PLACEHOLDER.highlightPreTag}llo${
              TAG_PLACEHOLDER.highlightPostTag
            }`,
          },
        },
      },
      {
        name: 'halloween',
        _highlightResult: {
          name: {
            value: `ha${TAG_PLACEHOLDER.highlightPreTag}llo${
              TAG_PLACEHOLDER.highlightPostTag
            }ween`,
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

    expect(rendering).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        hits: [
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
        ],
        results,
      }),
      expect.anything()
    );
  });

  describe('dispose', () => {
    it('calls the unmount function', () => {
      const renderFn = () => {};
      const unmountFn = jest.fn();
      const makeWidget = connectHits(renderFn, unmountFn);
      const widget = makeWidget();

      expect(unmountFn).toHaveBeenCalledTimes(0);

      widget.dispose();

      expect(unmountFn).toHaveBeenCalledTimes(1);
    });
  });
});
