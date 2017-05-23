import sinon from 'sinon';

import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;

import connectHits from '../connectHits.js';

const fakeClient = {addAlgoliaAgent: () => {}};

describe('connectHits', () => {
  it('Renders during init and render', () => {
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectHits(rendering);
    const widget = makeWidget();

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
    expect(rendering.lastCall.args[0].widgetParams).toEqual({});

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    // test that rendering has been called during init with isFirstRendering = false
    expect(rendering.callCount).toBe(2);
    expect(rendering.lastCall.args[1]).toBe(false);
    expect(rendering.lastCall.args[0].widgetParams).toEqual({});
  });

  it('Provides the hits and the whole results', () => {
    const rendering = sinon.stub();
    const makeWidget = connectHits(rendering);
    const widget = makeWidget({
      escapeHits: true,
      escapeHitsWhitelist: ['whitelisted'],
    });

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
      {fake: 'data'},
      {sample: 'infos'},
      {
        toEscape: '<a href="#top">Go to top</a>',
        _highlightResult: {
          toEscape: {
            wontEscape: '<h1>Not escaped</h1>',
            value: '<a href="#top">__ais-highlight__Go to top__/ais-highlight__</a>',
          },
        },
      },
      {
        toEscapeAlso: '<a href="#top">Go to top</a>',
        _highlightResult: {
          toEscape: {
            wontEscape: '<h1>Not escaped</h1>',
            value: {
              foo: '<a href="#top">__ais-highlight__Go to top__/ais-highlight__</a>',
              bar: '<a href="#top">__ais-highlight__Go to top__/ais-highlight__</a>',
            },
          },
        },
      },
      {
        whitelisted: '<a href="#top">Go to top</a>',
        _highlightResult: {
          whitelisted: {
            wontEscape: '<h1>Not escaped</h1>',
            value: '<a href="#top">__ais-highlight__Go to top__/ais-highlight__</a>',
          },
        },
      },
    ];

    const results = new SearchResults(helper.state, [{hits}]);
    widget.render({
      results,
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const processedHits = [
      {fake: 'data'},
      {sample: 'infos'},
      {
        toEscape: '&lt;a href=&quot;#top&quot;&gt;Go to top&lt;/a&gt;',
        _highlightResult: {
          toEscape: {
            wontEscape: '<h1>Not escaped</h1>',
            value: '&lt;a href=&quot;#top&quot;&gt;<em>Go to top</em>&lt;/a&gt;',
          },
        },
      },
      {
        toEscapeAlso: '&lt;a href=&quot;#top&quot;&gt;Go to top&lt;/a&gt;',
        _highlightResult: {
          toEscape: {
            wontEscape: '<h1>Not escaped</h1>',
            value: {
              foo: '&lt;a href=&quot;#top&quot;&gt;<em>Go to top</em>&lt;/a&gt;',
              bar: '&lt;a href=&quot;#top&quot;&gt;<em>Go to top</em>&lt;/a&gt;',
            },
          },
        },
      },
      {
        whitelisted: '<a href="#top">Go to top</a>',
        _highlightResult: {
          whitelisted: {
            wontEscape: '<h1>Not escaped</h1>',
            value: '<a href="#top"><em>Go to top</em></a>',
          },
        },
      },
    ];

    const secondRenderingOptions = rendering.lastCall.args[0];
    expect(secondRenderingOptions.hits).toEqual(processedHits);
    expect(secondRenderingOptions.results).toEqual(results);
  });
});
