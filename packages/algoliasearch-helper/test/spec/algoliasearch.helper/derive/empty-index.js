'use strict';

var algoliasearchHelper = require('../../../../');

describe('searches', function () {
  test('calls client.search for each derived helper that has an index', function () {
    var client = {
      search: jest.fn(function (requests) {
        return Promise.resolve({
          results: requests.map(function () {
            return { hits: [] };
          }),
        });
      }),
    };
    var helper = algoliasearchHelper(client, 'indexName');

    helper.derive(function (state) {
      return state.setIndex('indexName');
    });
    helper.derive(function (state) {
      return state.setIndex('');
    });
    helper.searchOnlyWithDerivedHelpers();

    expect(client.search).toHaveBeenCalledTimes(1);
    expect(client.search).toHaveBeenCalledWith([
      {
        indexName: 'indexName',
        params: {},
      },
    ]);
  });

  test('does not call client.search if all indices are empty', function () {
    var client = {
      search: jest.fn(function (requests) {
        return Promise.resolve({
          results: requests.map(function () {
            return { hits: [] };
          }),
        });
      }),
    };
    var helper = algoliasearchHelper(client, 'indexName');

    helper.derive(function (state) {
      return state.setIndex('');
    });
    helper.derive(function (state) {
      return state.setIndex('');
    });
    helper.searchOnlyWithDerivedHelpers();

    expect(client.search).toHaveBeenCalledTimes(0);
  });

  test('does not call client.search if no derived helpers', function () {
    var client = {
      search: jest.fn(function (requests) {
        return Promise.resolve({
          results: requests.map(function () {
            return { hits: [] };
          }),
        });
      }),
    };
    var helper = algoliasearchHelper(client, 'indexName');

    helper.searchOnlyWithDerivedHelpers();

    expect(client.search).toHaveBeenCalledTimes(0);
  });
});

describe('lastResults', function () {
  test('gives a result for each derived helper that has an index', function () {
    var client = {
      search: jest.fn(function (requests) {
        return Promise.resolve({
          results: requests.map(function () {
            return { hits: [] };
          }),
        });
      }),
    };
    var helper = algoliasearchHelper(client, 'indexName');

    helper.derive(function (state) {
      return state.setIndex('indexName');
    });
    helper.derive(function (state) {
      return state.setIndex('');
    });
    helper.searchOnlyWithDerivedHelpers();

    return Promise.resolve().then(function () {
      expect(helper.derivedHelpers[0].lastResults).toEqual(
        new algoliasearchHelper.SearchResults(
          new algoliasearchHelper.SearchParameters({ index: 'indexName' }),
          [{ hits: [] }]
        )
      );
      expect(helper.derivedHelpers[1].lastResults).toBe(null);
    });
  });
});

describe('result event', function () {
  test('gives a result event for each derived helper', function () {
    var client = {
      search: jest.fn(function (requests) {
        return Promise.resolve({
          results: requests.map(function () {
            return { hits: [] };
          }),
        });
      }),
    };
    var helper = algoliasearchHelper(client, 'indexName');

    var derivedResultSpy1 = jest.fn();
    helper
      .derive(function (state) {
        return state.setIndex('indexName');
      })
      .on('result', derivedResultSpy1);
    var derivedResultSpy2 = jest.fn();
    helper
      .derive(function (state) {
        return state.setIndex('');
      })
      .on('result', derivedResultSpy2);
    helper.searchOnlyWithDerivedHelpers();

    return Promise.resolve().then(function () {
      expect(derivedResultSpy1).toHaveBeenCalledTimes(1);
      expect(derivedResultSpy1).toHaveBeenCalledWith({
        state: new algoliasearchHelper.SearchParameters({ index: 'indexName' }),
        results: new algoliasearchHelper.SearchResults(
          new algoliasearchHelper.SearchParameters({ index: 'indexName' }),
          [{ hits: [] }]
        ),
      });
      expect(derivedResultSpy2).toHaveBeenCalledTimes(1);
      expect(derivedResultSpy2).toHaveBeenCalledWith({
        state: new algoliasearchHelper.SearchParameters({ index: '' }),
        results: null,
      });
    });
  });

  test('gives a result event for each derived helper when no query is done', function () {
    var client = {
      search: jest.fn(function (requests) {
        return Promise.resolve({
          results: requests.map(function () {
            return { hits: [] };
          }),
        });
      }),
    };
    var helper = algoliasearchHelper(client, 'indexName');

    var derivedResultSpy1 = jest.fn();
    helper
      .derive(function (state) {
        return state.setIndex('');
      })
      .on('result', derivedResultSpy1);
    helper.searchOnlyWithDerivedHelpers();

    return Promise.resolve().then(function () {
      expect(derivedResultSpy1).toHaveBeenCalledTimes(1);
      expect(derivedResultSpy1).toHaveBeenCalledWith({
        state: new algoliasearchHelper.SearchParameters({ index: '' }),
        results: null,
      });
    });
  });
});
