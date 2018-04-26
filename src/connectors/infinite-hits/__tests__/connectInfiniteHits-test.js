import sinon from 'sinon';

import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;

import connectInfiniteHits from '../connectInfiniteHits.js';

describe('connectInfiniteHits', () => {
  it('Renders during init and render', () => {
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectInfiniteHits(rendering);
    const widget = makeWidget({
      escapeHits: true,
      hitsPerPage: 10,
    });

    expect(widget.getConfiguration()).toEqual({
      highlightPostTag: '__/ais-highlight__',
      highlightPreTag: '__ais-highlight__',
    });

    // test if widget is not rendered yet at this point
    expect(rendering.callCount).toBe(0);

    const helper = jsHelper({}, '');
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
    expect(rendering.lastCall.args[0].widgetParams).toEqual({
      escapeHits: true,
      hitsPerPage: 10,
    });

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

    // test that rendering has been called during init with isFirstRendering = false
    expect(rendering.callCount).toBe(2);
    expect(rendering.lastCall.args[1]).toBe(false);
    expect(rendering.lastCall.args[0].widgetParams).toEqual({
      escapeHits: true,
      hitsPerPage: 10,
    });
  });

  it('Provides the hits and the whole results', () => {
    const rendering = sinon.stub();
    const makeWidget = connectInfiniteHits(rendering);
    const widget = makeWidget();

    const helper = jsHelper({}, '', {});
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.lastCall.args[0];
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

    const secondRenderingOptions = rendering.lastCall.args[0];
    const { showMore } = secondRenderingOptions;
    expect(secondRenderingOptions.hits).toEqual(hits);
    expect(secondRenderingOptions.results).toEqual(results);
    showMore();
    expect(helper.search.callCount).toBe(1);

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

    const thirdRenderingOptions = rendering.lastCall.args[0];
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

    const fourthRenderingOptions = rendering.lastCall.args[0];
    expect(fourthRenderingOptions.hits).toEqual(thirdHits);
    expect(fourthRenderingOptions.results).toEqual(thirdResults);
  });

  it('escape highlight properties if requested', () => {
    const rendering = sinon.stub();
    const makeWidget = connectInfiniteHits(rendering);
    const widget = makeWidget({ escapeHits: true });

    const helper = jsHelper({}, '', {});
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.lastCall.args[0];
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
            value: '&lt;script&gt;<em>foobar</em>&lt;/script&gt;',
          },
        },
      },
    ];

    const secondRenderingOptions = rendering.lastCall.args[0];
    expect(secondRenderingOptions.hits).toEqual(escapedHits);
    expect(secondRenderingOptions.results).toEqual(results);
  });
});
