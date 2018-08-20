import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;

import connectHits from '../connectHits';

describe('connectHits', () => {
  it('Renders during init and render', () => {
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = jest.fn();
    const makeWidget = connectHits(rendering);
    const widget = makeWidget({ escapeHits: true });

    expect(widget.getConfiguration()).toEqual({
      highlightPreTag: '__ais-highlight__',
      highlightPostTag: '__/ais-highlight__',
    });

    // test if widget is not rendered yet at this point
    expect(rendering).toHaveBeenCalledTimes(0);

    const helper = jsHelper({}, '', {});
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
      expect.objectContaining({ widgetParams: { escapeHits: true } }),
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
      expect.objectContaining({ widgetParams: { escapeHits: true } }),
      false
    );
  });

  it('Provides the hits and the whole results', () => {
    const rendering = jest.fn();
    const makeWidget = connectHits(rendering);
    const widget = makeWidget({});

    const helper = jsHelper({}, '', {});
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
    const widget = makeWidget({ escapeHits: true });

    const helper = jsHelper({}, '', {});
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
            value: '<script>__ais-highlight__foobar__/ais-highlight__</script>',
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
            value: '&lt;script&gt;<em>foobar</em>&lt;/script&gt;',
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

    const helper = jsHelper({}, '', {});
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
});
