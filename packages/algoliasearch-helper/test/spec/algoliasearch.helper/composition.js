'use strict';

var algoliaSearchHelper = require('../../../index');

function makeFakeCompositionClient(response) {
  return {
    search: jest.fn(function () {
      return Promise.resolve(response);
    }),
  };
}

function makeFeedResult(feedID, overrides) {
  return Object.assign(
    {
      feedID: feedID,
      hits: [],
      nbHits: 0,
      page: 0,
      nbPages: 0,
      hitsPerPage: 10,
      processingTimeMS: 1,
      query: '',
      index: 'my-index',
    },
    overrides
  );
}

describe('composition multifeed dispatch', function () {
  test('multifeed response populates _feedResults and _feedOrder', function () {
    var client = makeFakeCompositionClient({
      results: [
        makeFeedResult('products', {
          hits: [{ objectID: '1', name: 'Product A' }],
          nbHits: 100,
          nbPages: 10,
        }),
        makeFeedResult('articles', {
          hits: [{ objectID: '2', title: 'Article B' }],
          nbHits: 50,
          nbPages: 5,
        }),
      ],
    });

    var helper = algoliaSearchHelper(client, 'my-composition-id');
    var derivedHelper = helper.derive(function (state) {
      return state;
    });

    var resultPromise = new Promise(function (resolve) {
      derivedHelper.on('result', resolve);
    });

    helper.searchWithComposition();

    return resultPromise.then(function (event) {
      var results = event.results;

      // _feedResults map is populated
      expect(results._feedResults).toBeDefined();
      expect(Object.keys(results._feedResults)).toEqual([
        'products',
        'articles',
      ]);

      // _feedOrder preserves response order
      expect(results._feedOrder).toEqual(['products', 'articles']);

      // Each feed has its own SearchResults with correct data
      var products = results._feedResults.products;
      expect(products.hits).toEqual([{ objectID: '1', name: 'Product A' }]);
      expect(products.nbHits).toBe(100);
      expect(products.feedID).toBe('products');

      var articles = results._feedResults.articles;
      expect(articles.hits).toEqual([{ objectID: '2', title: 'Article B' }]);
      expect(articles.nbHits).toBe(50);
      expect(articles.feedID).toBe('articles');

      // Primary lastResults uses first feed
      expect(results.hits).toEqual([{ objectID: '1', name: 'Product A' }]);
      expect(results.nbHits).toBe(100);
      expect(results.feedID).toBe('products');

      derivedHelper.detach();
    });
  });

  test('single-feed response without feedID has no _feedResults (backward compat)', function () {
    var client = makeFakeCompositionClient({
      results: [
        {
          hits: [{ objectID: '1' }],
          nbHits: 1,
          page: 0,
          nbPages: 1,
          hitsPerPage: 10,
          processingTimeMS: 1,
          query: '',
          index: 'my-index',
        },
      ],
    });

    var helper = algoliaSearchHelper(client, 'my-composition-id');
    var derivedHelper = helper.derive(function (state) {
      return state;
    });

    var resultPromise = new Promise(function (resolve) {
      derivedHelper.on('result', resolve);
    });

    helper.searchWithComposition();

    return resultPromise.then(function (event) {
      var results = event.results;

      expect(results._feedResults).toBeUndefined();
      expect(results._feedOrder).toBeUndefined();
      expect(results.hits).toEqual([{ objectID: '1' }]);
      expect(results.nbHits).toBe(1);

      derivedHelper.detach();
    });
  });

  test('no compositionID (empty index) dispatches null results', function () {
    var client = makeFakeCompositionClient({
      results: [],
    });

    var helper = algoliaSearchHelper(client, '');
    var derivedHelper = helper.derive(function (state) {
      return state;
    });

    var resultPromise = new Promise(function (resolve) {
      derivedHelper.on('result', resolve);
    });

    helper.searchWithComposition();

    return resultPromise.then(function (event) {
      expect(event.results).toBeNull();

      derivedHelper.detach();
    });
  });

  test('captures all feeds regardless of count', function () {
    var client = makeFakeCompositionClient({
      results: [
        makeFeedResult('feed1'),
        makeFeedResult('feed2'),
        makeFeedResult('feed3'),
      ],
    });

    var helper = algoliaSearchHelper(client, 'my-composition-id');
    var derivedHelper = helper.derive(function (state) {
      return state;
    });

    var resultPromise = new Promise(function (resolve) {
      derivedHelper.on('result', resolve);
    });

    helper.searchWithComposition();

    return resultPromise.then(function (event) {
      var results = event.results;

      expect(results._feedOrder).toEqual(['feed1', 'feed2', 'feed3']);
      expect(Object.keys(results._feedResults)).toEqual([
        'feed1',
        'feed2',
        'feed3',
      ]);

      derivedHelper.detach();
    });
  });

  test('rawContent is propagated to each feed SearchResults', function () {
    var client = makeFakeCompositionClient({
      results: [makeFeedResult('products'), makeFeedResult('articles')],
      compositionID: 'my-composition-id',
    });

    var helper = algoliaSearchHelper(client, 'my-composition-id');
    var derivedHelper = helper.derive(function (state) {
      return state;
    });

    var resultPromise = new Promise(function (resolve) {
      derivedHelper.on('result', resolve);
    });

    helper.searchWithComposition();

    return resultPromise.then(function (event) {
      var results = event.results;

      expect(results._rawContent).toEqual({ compositionID: 'my-composition-id' });
      expect(results._feedResults.products._rawContent).toEqual({
        compositionID: 'my-composition-id',
      });
      expect(results._feedResults.articles._rawContent).toEqual({
        compositionID: 'my-composition-id',
      });

      derivedHelper.detach();
    });
  });

  test('client.search is called with composition query format', function () {
    var client = makeFakeCompositionClient({
      results: [makeFeedResult('products')],
    });

    var helper = algoliaSearchHelper(client, 'my-composition-id');
    var derivedHelper = helper.derive(function (state) {
      return state;
    });

    helper.searchWithComposition();

    expect(client.search).toHaveBeenCalledTimes(1);
    var query = client.search.mock.calls[0][0];
    expect(query.compositionID).toBe('my-composition-id');
    expect(query.requestBody).toBeDefined();
    expect(query.requestBody.params).toBeDefined();

    derivedHelper.detach();
  });

  test('derivedHelper emits search event on searchWithComposition', function () {
    var searched = jest.fn();
    var client = {
      search: jest.fn(function () {
        return new Promise(function () {});
      }),
    };

    var helper = algoliaSearchHelper(client, 'my-composition-id');
    var derivedHelper = helper.derive(function (state) {
      return state;
    });

    derivedHelper.on('search', searched);

    expect(searched).toHaveBeenCalledTimes(0);

    helper.searchWithComposition();

    expect(searched).toHaveBeenCalledTimes(1);
    expect(searched).toHaveBeenLastCalledWith({
      state: helper.state,
      results: null,
    });

    derivedHelper.detach();
  });

  test('empty results with valid compositionID creates empty SearchResults', function () {
    var client = makeFakeCompositionClient({
      results: [],
    });

    var helper = algoliaSearchHelper(client, 'my-composition-id');
    var derivedHelper = helper.derive(function (state) {
      return state;
    });

    var resultPromise = new Promise(function (resolve) {
      derivedHelper.on('result', resolve);
    });

    helper.searchWithComposition();

    return resultPromise.then(function (event) {
      var results = event.results;

      expect(results).toBeDefined();
      expect(results._feedResults).toBeUndefined();
      expect(results._feedOrder).toBeUndefined();
      expect(results.hits).toBeUndefined();
      expect(results.nbHits).toBeUndefined();

      derivedHelper.detach();
    });
  });

  test('multiple derived helpers throws (single-query guard)', function () {
    var client = makeFakeCompositionClient({ results: [] });

    var helper = algoliaSearchHelper(client, 'my-composition-id');
    var derivedHelper1 = helper.derive(function (state) {
      return state;
    });
    var derivedHelper2 = helper.derive(function (state) {
      return state;
    });

    expect(function () {
      helper.searchWithComposition();
    }).toThrow('Only one query is allowed when using a composition.');

    derivedHelper1.detach();
    derivedHelper2.detach();
  });

  test('error from client.search emits error event on helper', function () {
    var searchError = new Error('Composition search failed');
    var client = {
      search: jest.fn(function () {
        return Promise.reject(searchError);
      }),
    };

    var helper = algoliaSearchHelper(client, 'my-composition-id');
    var derivedHelper = helper.derive(function (state) {
      return state;
    });

    var errorPromise = new Promise(function (resolve) {
      helper.on('error', resolve);
    });

    helper.searchWithComposition();

    return errorPromise.then(function (event) {
      expect(event.error).toBe(searchError);

      derivedHelper.detach();
    });
  });

  test('sequential searches with different feeds update results correctly', function () {
    var firstResponse = {
      results: [
        makeFeedResult('products', { hits: [{ objectID: '1' }], nbHits: 1 }),
        makeFeedResult('articles', { hits: [{ objectID: '2' }], nbHits: 1 }),
      ],
    };

    var secondResponse = {
      results: [
        makeFeedResult('videos', { hits: [{ objectID: '3' }], nbHits: 1 }),
      ],
    };

    var callCount = 0;
    var client = {
      search: jest.fn(function () {
        callCount++;
        if (callCount === 1) return Promise.resolve(firstResponse);
        return Promise.resolve(secondResponse);
      }),
    };

    var helper = algoliaSearchHelper(client, 'my-composition-id');
    var derivedHelper = helper.derive(function (state) {
      return state;
    });

    var resultCount = 0;
    var secondResultPromise = new Promise(function (resolve) {
      derivedHelper.on('result', function (event) {
        resultCount++;
        if (resultCount === 2) resolve(event);
      });
    });

    helper.searchWithComposition();
    helper.searchWithComposition();

    return secondResultPromise.then(function (event) {
      var results = event.results;

      // Second response replaces first: only 'videos', no 'products'/'articles'
      expect(results._feedOrder).toEqual(['videos']);
      expect(Object.keys(results._feedResults)).toEqual(['videos']);
      expect(results._feedResults.videos.hits).toEqual([{ objectID: '3' }]);

      derivedHelper.detach();
    });
  });
});
