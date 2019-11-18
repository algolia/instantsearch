'use strict';

var algoliasearchHelper = require('../../../index');

function makeFakeSearchForFacetValuesResponse() {
  return {
    exhaustiveFacetsCount: true,
    facetHits: [],
    processingTimeMS: 3
  };
}

test('searchForFacetValues calls the client method over the index method', function() {
  var clientSearchForFacetValues = jest.fn(function() {
    return Promise.resolve([makeFakeSearchForFacetValuesResponse()]);
  });

  var indexSearchForFacetValues = jest.fn(function() {
    return Promise.resolve(makeFakeSearchForFacetValuesResponse());
  });

  var fakeClient = {
    searchForFacetValues: clientSearchForFacetValues,
    initIndex: function() {
      return {
        searchForFacetValues: indexSearchForFacetValues
      };
    }
  };

  var helper = algoliasearchHelper(fakeClient, 'index');

  return helper.searchForFacetValues('facet', 'query', 1).then(function() {
    expect(clientSearchForFacetValues).toHaveBeenCalledTimes(1);
    expect(indexSearchForFacetValues).toHaveBeenCalledTimes(0);
  });
});

test('searchForFacetValues calls the index method if no client method', function() {
  var indexSearchForFacetValues = jest.fn(function() {
    return Promise.resolve(makeFakeSearchForFacetValuesResponse());
  });

  var fakeClient = {
    initIndex: function() {
      return {
        searchForFacetValues: indexSearchForFacetValues
      };
    }
  };

  var helper = algoliasearchHelper(fakeClient, 'index');

  return helper.searchForFacetValues('facet', 'query', 1).then(function() {
    expect(indexSearchForFacetValues).toHaveBeenCalledTimes(1);
  });
});

test('searchForFacetValues resolve with the correct response from client', function() {
  var fakeClient = {
    addAlgoliaAgent: function() {},
    searchForFacetValues: function() {
      return Promise.resolve([
        makeFakeSearchForFacetValuesResponse()
      ]);
    }
  };

  var helper = algoliasearchHelper(fakeClient, 'index');

  return helper.searchForFacetValues('facet', 'query', 1).then(function(content) {
    expect(content.exhaustiveFacetsCount).toBe(true);
    expect(content.facetHits.length).toBe(0);
    expect(content.processingTimeMS).toBe(3);
  });
});

test('searchForFacetValues resolve with the correct response from initIndex', function() {
  var fakeClient = {
    addAlgoliaAgent: function() {},
    initIndex: function() {
      return {
        searchForFacetValues: function() {
          return Promise.resolve(makeFakeSearchForFacetValuesResponse());
        }
      };
    }
  };

  var helper = algoliasearchHelper(fakeClient, 'index');

  return helper.searchForFacetValues('facet', 'query', 1).then(function(content) {
    expect(content.exhaustiveFacetsCount).toBe(true);
    expect(content.facetHits.length).toBe(0);
    expect(content.processingTimeMS).toBe(3);
  });
});

test('index.searchForFacetValues should search for facetValues with the current state', function() {
  var indexSearchForFacetValues = jest.fn(function() {
    return Promise.resolve(makeFakeSearchForFacetValuesResponse());
  });

  var fakeClient = {
    initIndex: function() {
      return {
        searchForFacetValues: indexSearchForFacetValues
      };
    }
  };

  var helper = algoliasearchHelper(fakeClient, 'index', {
    highlightPreTag: 'HIGHLIGHT>',
    highlightPostTag: '<HIGHLIGHT',
    query: 'iphone'
  });

  helper.searchForFacetValues('facet', 'query', 75);

  var lastArguments = indexSearchForFacetValues.mock.calls[0][0];

  expect(lastArguments.query).toBe('iphone');
  expect(lastArguments.facetQuery).toBe('query');
  expect(lastArguments.facetName).toBe('facet');
  expect(lastArguments.highlightPreTag).toBe('HIGHLIGHT>');
  expect(lastArguments.highlightPostTag).toBe('<HIGHLIGHT');
});

test('index.searchForFacetValues can override the current search state', function() {
  var indexSearchForFacetValues = jest.fn(function() {
    return Promise.resolve(makeFakeSearchForFacetValuesResponse());
  });

  var fakeClient = {
    initIndex: function() {
      return {
        searchForFacetValues: indexSearchForFacetValues
      };
    }
  };

  var helper = algoliasearchHelper(fakeClient, 'index', {
    highlightPreTag: 'HIGHLIGHT>',
    highlightPostTag: '<HIGHLIGHT',
    query: 'iphone'
  });

  helper.searchForFacetValues('facet', 'query', 75, {
    query: undefined,
    highlightPreTag: 'highlightTag'
  });

  var lastArguments = indexSearchForFacetValues.mock.calls[0][0];

  expect(lastArguments.hasOwnProperty('query')).toBeFalsy();
  expect(lastArguments.facetQuery).toBe('query');
  expect(lastArguments.facetName).toBe('facet');
  expect(lastArguments.highlightPreTag).toBe('highlightTag');
  expect(lastArguments.highlightPostTag).toBe('<HIGHLIGHT');
});

test('client.searchForFacetValues should search for facetValues with the current state', function() {
  var clientSearchForFacetValues = jest.fn(function() {
    return Promise.resolve([makeFakeSearchForFacetValuesResponse()]);
  });

  var fakeClient = {
    searchForFacetValues: clientSearchForFacetValues
  };

  var helper = algoliasearchHelper(fakeClient, 'index', {
    highlightPreTag: 'HIGHLIGHT>',
    highlightPostTag: '<HIGHLIGHT',
    query: 'iphone'
  });

  helper.searchForFacetValues('facet', 'query', 75);

  var lastArguments = clientSearchForFacetValues.mock.calls[0][0][0];

  expect(lastArguments.indexName).toBe('index');
  expect(lastArguments.params.query).toBe('iphone');
  expect(lastArguments.params.facetQuery).toBe('query');
  expect(lastArguments.params.facetName).toBe('facet');
  expect(lastArguments.params.highlightPreTag).toBe('HIGHLIGHT>');
  expect(lastArguments.params.highlightPostTag).toBe('<HIGHLIGHT');
});

test('client.searchForFacetValues can override the current search state', function() {
  var clientSearchForFacetValues = jest.fn(function() {
    return Promise.resolve([makeFakeSearchForFacetValuesResponse()]);
  });

  var fakeClient = {
    searchForFacetValues: clientSearchForFacetValues
  };

  var helper = algoliasearchHelper(fakeClient, 'index', {
    highlightPreTag: 'HIGHLIGHT>',
    highlightPostTag: '<HIGHLIGHT',
    query: 'iphone'
  });

  helper.searchForFacetValues('facet', 'query', 75, {
    query: undefined,
    highlightPreTag: 'highlightTag'
  });

  var lastArguments = clientSearchForFacetValues.mock.calls[0][0][0];

  expect(lastArguments.indexName).toBe('index');
  expect(lastArguments.params.hasOwnProperty('query')).toBeFalsy();
  expect(lastArguments.params.facetQuery).toBe('query');
  expect(lastArguments.params.facetName).toBe('facet');
  expect(lastArguments.params.highlightPreTag).toBe('highlightTag');
  expect(lastArguments.params.highlightPostTag).toBe('<HIGHLIGHT');
});

test('an error will be thrown if the client does not contain .searchForFacetValues', function() {
  var fakeClient = {};
  var helper = algoliasearchHelper(fakeClient, 'index');

  try {
    helper.searchForFacetValues('facet', 'query');
  } catch (e) {
    expect(e.message).toBe(
      'search for facet values (searchable) was called, but this client does not have a function client.searchForFacetValues or client.initIndex(index).searchForFacetValues'
    );
  }
});
