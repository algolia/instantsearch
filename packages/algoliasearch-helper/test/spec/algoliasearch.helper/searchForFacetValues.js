'use strict';

var algoliasearchHelper = require('../../../index');

function makeFakeSearchForFacetValuesResponse() {
  return {
    exhaustiveFacetsCount: true,
    facetHits: [],
    processingTimeMS: 3,
  };
}

test('searchForFacetValues calls the client method over the index method', function () {
  var clientSearchForFacetValues = jest.fn(function () {
    return Promise.resolve([makeFakeSearchForFacetValuesResponse()]);
  });

  var indexSearchForFacetValues = jest.fn(function () {
    return Promise.resolve(makeFakeSearchForFacetValuesResponse());
  });

  var fakeClient = {
    searchForFacetValues: clientSearchForFacetValues,
    initIndex: function () {
      return {
        searchForFacetValues: indexSearchForFacetValues,
      };
    },
  };

  var helper = algoliasearchHelper(fakeClient, 'index');

  return helper.searchForFacetValues('facet', 'query', 1).then(function () {
    expect(clientSearchForFacetValues).toHaveBeenCalledTimes(1);
    expect(indexSearchForFacetValues).toHaveBeenCalledTimes(0);
  });
});

test('searchForFacetValues calls the index method if no client method', function () {
  var indexSearchForFacetValues = jest.fn(function () {
    return Promise.resolve(makeFakeSearchForFacetValuesResponse());
  });

  var fakeClient = {
    initIndex: function () {
      return {
        searchForFacetValues: indexSearchForFacetValues,
      };
    },
  };

  var helper = algoliasearchHelper(fakeClient, 'index');

  return helper.searchForFacetValues('facet', 'query', 1).then(function () {
    expect(indexSearchForFacetValues).toHaveBeenCalledTimes(1);
  });
});

test('searchForFacetValues resolve with the correct response from client', function () {
  var fakeClient = {
    addAlgoliaAgent: function () {},
    searchForFacetValues: function () {
      return Promise.resolve([makeFakeSearchForFacetValuesResponse()]);
    },
  };

  var helper = algoliasearchHelper(fakeClient, 'index');

  return helper
    .searchForFacetValues('facet', 'query', 1)
    .then(function (content) {
      expect(content.exhaustiveFacetsCount).toBe(true);
      expect(content.facetHits.length).toBe(0);
      expect(content.processingTimeMS).toBe(3);
    });
});

test('searchForFacetValues resolve with the correct response from initIndex', function () {
  var fakeClient = {
    addAlgoliaAgent: function () {},
    initIndex: function () {
      return {
        searchForFacetValues: function () {
          return Promise.resolve(makeFakeSearchForFacetValuesResponse());
        },
      };
    },
  };

  var helper = algoliasearchHelper(fakeClient, 'index');

  return helper
    .searchForFacetValues('facet', 'query', 1)
    .then(function (content) {
      expect(content.exhaustiveFacetsCount).toBe(true);
      expect(content.facetHits.length).toBe(0);
      expect(content.processingTimeMS).toBe(3);
    });
});

test('index.searchForFacetValues should search for facetValues with the current state', function () {
  var indexSearchForFacetValues = jest.fn(function () {
    return Promise.resolve(makeFakeSearchForFacetValuesResponse());
  });

  var fakeClient = {
    initIndex: function () {
      return {
        searchForFacetValues: indexSearchForFacetValues,
      };
    },
  };

  var helper = algoliasearchHelper(fakeClient, 'index', {
    highlightPreTag: 'HIGHLIGHT>',
    highlightPostTag: '<HIGHLIGHT',
    query: 'iphone',
  });

  helper.searchForFacetValues('facet', 'query', 75);

  var lastArguments = indexSearchForFacetValues.mock.calls[0][0];

  expect(lastArguments.query).toBe('iphone');
  expect(lastArguments.facetQuery).toBe('query');
  expect(lastArguments.facetName).toBe('facet');
  expect(lastArguments.highlightPreTag).toBe('HIGHLIGHT>');
  expect(lastArguments.highlightPostTag).toBe('<HIGHLIGHT');
});

test('index.searchForFacetValues can override the current search state', function () {
  var indexSearchForFacetValues = jest.fn(function () {
    return Promise.resolve(makeFakeSearchForFacetValuesResponse());
  });

  var fakeClient = {
    initIndex: function () {
      return {
        searchForFacetValues: indexSearchForFacetValues,
      };
    },
  };

  var helper = algoliasearchHelper(fakeClient, 'index', {
    highlightPreTag: 'HIGHLIGHT>',
    highlightPostTag: '<HIGHLIGHT',
    query: 'iphone',
  });

  helper.searchForFacetValues('facet', 'query', 75, {
    query: undefined,
    highlightPreTag: 'highlightTag',
  });

  var lastArguments = indexSearchForFacetValues.mock.calls[0][0];

  expect(lastArguments.hasOwnProperty('query')).toBeFalsy();
  expect(lastArguments.facetQuery).toBe('query');
  expect(lastArguments.facetName).toBe('facet');
  expect(lastArguments.highlightPreTag).toBe('highlightTag');
  expect(lastArguments.highlightPostTag).toBe('<HIGHLIGHT');
});

test('client.searchForFacetValues should search for facetValues with the current state', function () {
  var clientSearchForFacetValues = jest.fn(function () {
    return Promise.resolve([makeFakeSearchForFacetValuesResponse()]);
  });

  var fakeClient = {
    searchForFacetValues: clientSearchForFacetValues,
  };

  var helper = algoliasearchHelper(fakeClient, 'index', {
    highlightPreTag: 'HIGHLIGHT>',
    highlightPostTag: '<HIGHLIGHT',
    query: 'iphone',
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

test('client.searchForFacetValues can override the current search state', function () {
  var clientSearchForFacetValues = jest.fn(function () {
    return Promise.resolve([makeFakeSearchForFacetValuesResponse()]);
  });

  var fakeClient = {
    searchForFacetValues: clientSearchForFacetValues,
  };

  var helper = algoliasearchHelper(fakeClient, 'index', {
    highlightPreTag: 'HIGHLIGHT>',
    highlightPostTag: '<HIGHLIGHT',
    query: 'iphone',
  });

  helper.searchForFacetValues('facet', 'query', 75, {
    query: undefined,
    highlightPreTag: 'highlightTag',
  });

  var lastArguments = clientSearchForFacetValues.mock.calls[0][0][0];

  expect(lastArguments.indexName).toBe('index');
  expect(lastArguments.params.hasOwnProperty('query')).toBeFalsy();
  expect(lastArguments.params.facetQuery).toBe('query');
  expect(lastArguments.params.facetName).toBe('facet');
  expect(lastArguments.params.highlightPreTag).toBe('highlightTag');
  expect(lastArguments.params.highlightPostTag).toBe('<HIGHLIGHT');
});

test('client.search should search for facetValues with the current state', function () {
  var clientSearch = jest.fn(function () {
    return Promise.resolve({
      results: [makeFakeSearchForFacetValuesResponse()],
    });
  });

  var fakeClient = {
    search: clientSearch,
  };

  var helper = algoliasearchHelper(fakeClient, 'index', {
    highlightPreTag: 'HIGHLIGHT>',
    highlightPostTag: '<HIGHLIGHT',
    query: 'iphone',
  });

  helper.searchForFacetValues('facet', 'query', 75);

  var lastArguments = clientSearch.mock.calls[0][0][0];

  expect(lastArguments.indexName).toBe('index');
  expect(lastArguments.params.query).toBe('iphone');
  expect(lastArguments.params.facetQuery).toBe('query');
  expect(lastArguments.params.hasOwnProperty('facetName')).toBeFalsy();
  expect(lastArguments.facet).toBe('facet');
  expect(lastArguments.params.highlightPreTag).toBe('HIGHLIGHT>');
  expect(lastArguments.params.highlightPostTag).toBe('<HIGHLIGHT');
});

test('client.search can override the current search state', function () {
  var clientSearch = jest.fn(function () {
    return Promise.resolve({
      results: [makeFakeSearchForFacetValuesResponse()],
    });
  });

  var fakeClient = {
    search: clientSearch,
  };

  var helper = algoliasearchHelper(fakeClient, 'index', {
    highlightPreTag: 'HIGHLIGHT>',
    highlightPostTag: '<HIGHLIGHT',
    query: 'iphone',
  });

  helper.searchForFacetValues('facet', 'query', 75, {
    query: undefined,
    highlightPreTag: 'highlightTag',
  });

  var lastArguments = clientSearch.mock.calls[0][0][0];

  expect(lastArguments.indexName).toBe('index');
  expect(lastArguments.params.hasOwnProperty('query')).toBeFalsy();
  expect(lastArguments.params.facetQuery).toBe('query');
  expect(lastArguments.params.hasOwnProperty('facetName')).toBeFalsy();
  expect(lastArguments.facet).toBe('facet');
  expect(lastArguments.params.highlightPreTag).toBe('highlightTag');
  expect(lastArguments.params.highlightPostTag).toBe('<HIGHLIGHT');
});

test('an error will be thrown if the client does not contain .searchForFacetValues', function () {
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

test('isRefined is set for disjunctive facets', function () {
  var fakeClient = {
    addAlgoliaAgent: function () {},
    searchForFacetValues: function () {
      return Promise.resolve([
        {
          exhaustiveFacetsCount: true,
          facetHits: [
            {
              count: 318,
              highlighted: '__ais-highlight__K__/ais-highlight__itchenAid',
              value: 'KitchenAid',
            },
            {
              count: 1,
              highlighted: 'something',
              value: 'something',
            },
          ],
          processingTimeMS: 3,
        },
      ]);
    },
  };

  var helper = algoliasearchHelper(fakeClient, 'index', {
    disjunctiveFacets: ['facet'],
    disjunctiveFacetsRefinements: {
      facet: ['KitchenAid'],
    },
  });

  return helper.searchForFacetValues('facet', 'k', 1).then(function (content) {
    expect(content.exhaustiveFacetsCount).toBe(true);
    expect(content.processingTimeMS).toBe(3);
    expect(content.facetHits.length).toBe(2);
    expect(content.facetHits[0].value).toBe('KitchenAid');
    expect(content.facetHits[0].isRefined).toBe(true);
    expect(content.facetHits[1].value).toBe('something');
    expect(content.facetHits[1].isRefined).toBe(false);
  });
});

test('isRefined is set for conjunctive facets', function () {
  var fakeClient = {
    addAlgoliaAgent: function () {},
    searchForFacetValues: function () {
      return Promise.resolve([
        {
          exhaustiveFacetsCount: true,
          facetHits: [
            {
              count: 318,
              highlighted: '__ais-highlight__K__/ais-highlight__itchenAid',
              value: 'KitchenAid',
            },
            {
              count: 1,
              highlighted: 'something',
              value: 'something',
            },
          ],
          processingTimeMS: 3,
        },
      ]);
    },
  };

  var helper = algoliasearchHelper(fakeClient, 'index', {
    facets: ['facet'],
    facetsRefinements: {
      facet: ['KitchenAid'],
    },
  });

  return helper.searchForFacetValues('facet', 'k', 1).then(function (content) {
    expect(content.exhaustiveFacetsCount).toBe(true);
    expect(content.processingTimeMS).toBe(3);
    expect(content.facetHits.length).toBe(2);
    expect(content.facetHits[0].value).toBe('KitchenAid');
    expect(content.facetHits[0].isRefined).toBe(true);
    expect(content.facetHits[1].value).toBe('something');
    expect(content.facetHits[1].isRefined).toBe(false);
  });
});

test('value is escaped when it starts with `-`', function () {
  var fakeClient = {
    addAlgoliaAgent: function () {},
    searchForFacetValues: function () {
      return Promise.resolve([
        {
          exhaustiveFacetsCount: true,
          facetHits: [
            {
              count: 318,
              highlighted: 'something',
              value: 'something',
            },
            {
              count: 1,
              highlighted: '-20%',
              value: '-20%',
            },
          ],
          processingTimeMS: 3,
        },
      ]);
    },
  };

  var helper = algoliasearchHelper(fakeClient, 'index');

  return helper.searchForFacetValues('facet', 'k', 1).then(function (content) {
    expect(content.exhaustiveFacetsCount).toBe(true);
    expect(content.processingTimeMS).toBe(3);
    expect(content.facetHits.length).toBe(2);
    expect(content.facetHits[0].value).toBe('something');
    expect(content.facetHits[0].escapedValue).toBe('something');
    expect(content.facetHits[1].value).toBe('-20%');
    expect(content.facetHits[1].escapedValue).toBe('\\-20%');
  });
});

test('escaped value is marked as refined', function () {
  var fakeClient = {
    addAlgoliaAgent: function () {},
    searchForFacetValues: function () {
      return Promise.resolve([
        {
          exhaustiveFacetsCount: true,
          facetHits: [
            {
              count: 318,
              highlighted: 'something',
              value: 'something',
            },
            {
              count: 1,
              highlighted: '-20%',
              value: '-20%',
            },
          ],
          processingTimeMS: 3,
        },
      ]);
    },
  };

  var helper = algoliasearchHelper(fakeClient, 'index', {
    disjunctiveFacets: ['facet'],
    disjunctiveFacetsRefinements: {
      facet: ['\\-20%', 'something'],
    },
  });

  return helper.searchForFacetValues('facet', 'k', 1).then(function (content) {
    expect(content).toEqual({
      exhaustiveFacetsCount: true,
      processingTimeMS: 3,
      facetHits: [
        {
          count: 318,
          highlighted: 'something',
          isRefined: true,
          escapedValue: 'something',
          value: 'something',
        },
        {
          count: 1,
          highlighted: '-20%',
          isRefined: true,
          escapedValue: '\\-20%',
          value: '-20%',
        },
      ],
    });
  });
});
