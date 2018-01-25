import sinon from 'sinon';

import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;

import connectHits from '../connectHits.js';

const fakeClient = { addAlgoliaAgent: () => {} };

describe('connectHits', () => {
  it('Renders during init and render', () => {
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectHits(rendering);
    const widget = makeWidget({ escapeHits: true });

    expect(widget.getConfiguration()).toEqual({
      highlightPreTag: '__ais-highlight__',
      highlightPostTag: '__/ais-highlight__',
    });

    // test if widget is not rendered yet at this point
    expect(rendering.callCount).toBe(0);

    const helper = jsHelper(fakeClient, '', {});
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
    });

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    // test that rendering has been called during init with isFirstRendering = false
    expect(rendering.callCount).toBe(2);
    expect(rendering.lastCall.args[1]).toBe(false);
    expect(rendering.lastCall.args[0].widgetParams).toEqual({
      escapeHits: true,
    });
  });

  it('Provides the hits and the whole results', () => {
    const rendering = sinon.stub();
    const makeWidget = connectHits(rendering);
    const widget = makeWidget({});

    const helper = jsHelper(fakeClient, '', {});
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

    const results = new SearchResults(helper.state, [
      { hits: [].concat(hits) },
    ]);
    widget.render({
      results,
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.lastCall.args[0];
    expect(secondRenderingOptions.hits).toEqual(hits);
    expect(secondRenderingOptions.results).toEqual(results);
  });

  it('escape highlight properties if requested', () => {
    const rendering = sinon.stub();
    const makeWidget = connectHits(rendering);
    const widget = makeWidget({ escapeHits: true });

    const helper = jsHelper(fakeClient, '', {});
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

    escapedHits.__escaped = true;

    const secondRenderingOptions = rendering.lastCall.args[0];
    expect(secondRenderingOptions.hits).toEqual(escapedHits);
    expect(secondRenderingOptions.results).toEqual(results);
  });
});
