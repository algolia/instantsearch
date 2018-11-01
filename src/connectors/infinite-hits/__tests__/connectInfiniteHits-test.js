import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;

import connectInfiniteHits from '../connectInfiniteHits.js';

describe('connectInfiniteHits', () => {
  it('Renders during init and render', () => {
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = jest.fn();
    const makeWidget = connectInfiniteHits(rendering);
    const widget = makeWidget({
      escapeHTML: true,
    });

    expect(widget.getConfiguration()).toEqual({
      highlightPostTag: '__/ais-highlight__',
      highlightPreTag: '__ais-highlight__',
    });

    // test if widget is not rendered yet at this point
    expect(rendering).toHaveBeenCalledTimes(0);

    const helper = jsHelper({}, '');
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    // test that rendering has been called during init with isFirstRendering = true
    expect(rendering).toHaveBeenCalledTimes(1);
    // test if isFirstRendering is true during init
    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        hits: [],
        showMore: expect.any(Function),
        results: undefined,
        isLastPage: true,
        instantSearchInstance: undefined,
        widgetParams: {
          escapeHTML: true,
        },
      }),
      true
    );

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [],
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(rendering).toHaveBeenCalledTimes(2);
    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        hits: [],
        showMore: expect.any(Function),
        results: expect.any(Object),
        isLastPage: false,
        instantSearchInstance: undefined,
        widgetParams: {
          escapeHTML: true,
        },
      }),
      false
    );
  });

  it('Provides the hits and the whole results', () => {
    const rendering = jest.fn();
    const makeWidget = connectInfiniteHits(rendering);
    const widget = makeWidget();

    const helper = jsHelper({}, '', {});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.hits).toEqual([]);
    expect(firstRenderingOptions.results).toBe(undefined);

    const hits = [{ fake: 'data' }, { sample: 'infos' }];
    const results = new SearchResults(helper.state, [{ hits }]);
    widget.render({
      results,
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.mock.calls[1][0];
    const { showMore } = secondRenderingOptions;
    expect(secondRenderingOptions.hits).toEqual(hits);
    expect(secondRenderingOptions.results).toEqual(results);
    showMore();
    expect(helper.search).toHaveBeenCalledTimes(1);

    // the results should accumulate if there is an increment in page
    const otherHits = [{ fake: 'data 2' }, { sample: 'infos 2' }];
    const otherResults = new SearchResults(helper.state, [
      {
        hits: otherHits,
      },
    ]);
    widget.render({
      results: otherResults,
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const thirdRenderingOptions = rendering.mock.calls[2][0];
    expect(thirdRenderingOptions.hits).toEqual([...hits, ...otherHits]);
    expect(thirdRenderingOptions.results).toEqual(otherResults);

    helper.setPage(0);

    // If the page goes back to 0, the hits cache should be flushed

    const thirdHits = [{ fake: 'data 3' }, { sample: 'infos 3' }];
    const thirdResults = new SearchResults(helper.state, [
      {
        hits: thirdHits,
      },
    ]);
    widget.render({
      results: thirdResults,
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const fourthRenderingOptions = rendering.mock.calls[3][0];
    expect(fourthRenderingOptions.hits).toEqual(thirdHits);
    expect(fourthRenderingOptions.results).toEqual(thirdResults);
  });

  it('escape highlight properties if requested', () => {
    const rendering = jest.fn();
    const makeWidget = connectInfiniteHits(rendering);
    const widget = makeWidget({ escapeHTML: true });

    const helper = jsHelper({}, '', {});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.hits).toEqual([]);
    expect(firstRenderingOptions.results).toBe(undefined);

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
            value: '&lt;script&gt;<mark>foobar</mark>&lt;/script&gt;',
          },
        },
      },
    ];

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.hits).toEqual(escapedHits);
    expect(secondRenderingOptions.results).toEqual(results);
  });

  it('transform items if requested', () => {
    const rendering = jest.fn();
    const makeWidget = connectInfiniteHits(rendering);
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

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.hits).toEqual([]);
    expect(firstRenderingOptions.results).toBe(undefined);

    const hits = [
      {
        name: 'name 1',
      },
      {
        name: 'name 2',
      },
    ];

    const results = new SearchResults(helper.state, [{ hits }]);
    widget.render({
      results,
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const transformedHits = [
      {
        name: 'transformed',
      },
      {
        name: 'transformed',
      },
    ];

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.hits).toEqual(transformedHits);
    expect(secondRenderingOptions.results).toEqual(results);
  });

  it('transform items after escaping', () => {
    const rendering = jest.fn();
    const makeWidget = connectInfiniteHits(rendering);
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

    const helper = jsHelper({}, '', {});
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
            value: 'he__ais-highlight__llo__/ais-highlight__',
          },
        },
      },
      {
        name: 'halloween',
        _highlightResult: {
          name: {
            value: 'ha__ais-highlight__llo__/ais-highlight__ween',
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

  it('does not render the same page twice', () => {
    const rendering = jest.fn();
    const makeWidget = connectInfiniteHits(rendering);
    const widget = makeWidget({});

    const helper = jsHelper({}, '');
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [{ objectID: 'a' }],
          page: 0,
          nbPages: 4,
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    helper.setPage(1);

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [{ objectID: 'b' }],
          page: 1,
          nbPages: 4,
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(rendering).toHaveBeenCalledTimes(3);
    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        hits: [{ objectID: 'a' }, { objectID: 'b' }],
      }),
      false
    );

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [{ objectID: 'b' }],
          page: 1,
          nbPages: 4,
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(rendering).toHaveBeenCalledTimes(4);
    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        hits: [{ objectID: 'a' }, { objectID: 'b' }],
      }),
      false
    );
  });
});
