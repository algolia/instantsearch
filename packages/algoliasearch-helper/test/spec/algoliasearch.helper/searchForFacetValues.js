'use strict';

var algoliasearchHelper = require('../../../index');

function makeFakeSearchForFacetValuesResponse() {
  return {
    exhaustiveFacetsCount: true,
    facetHits: [],
    processingTimeMS: 3,
  };
}

test('searchForFacetValues only calls client.search', function () {
  var clientSearch = jest.fn(function () {
    return Promise.resolve({
      results: [makeFakeSearchForFacetValuesResponse()],
    });
  });

  var fakeClient = {
    searchForFacets: jest.fn(),
    searchForFacetValues: jest.fn(),
    initIndex: jest.fn(),
    search: clientSearch,
  };

  var helper = algoliasearchHelper(fakeClient, 'index');

  return helper.searchForFacetValues('facet', 'query', 1).then(function () {
    expect(clientSearch).toHaveBeenCalledTimes(1);
    expect(clientSearch).toHaveBeenCalledWith([
      {
        type: 'facet',
        facet: 'facet',
        indexName: 'index',
        params: expect.objectContaining({
          facetQuery: 'query',
          maxFacetHits: 1,
        }),
      },
    ]);
    expect(fakeClient.searchForFacets).not.toHaveBeenCalled();
    expect(fakeClient.searchForFacetValues).not.toHaveBeenCalled();
    expect(fakeClient.initIndex).not.toHaveBeenCalled();
  });
});

test('searchForFacetValues resolve with the correct response from client', function () {
  var fakeClient = {
    addAlgoliaAgent: function () {},
    search: function () {
      return Promise.resolve({
        results: [makeFakeSearchForFacetValuesResponse()],
      });
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

test('an error will be thrown if the client does not contain .search', function () {
  var fakeClient = {};
  var helper = algoliasearchHelper(fakeClient, 'index');

  expect(function () {
    helper.searchForFacetValues('facet', 'query');
  }).toThrow(
    'search for facet values (searchable) was called, but this client does not have a function client.search'
  );
});

test('isRefined is set for disjunctive facets', function () {
  var fakeClient = {
    addAlgoliaAgent: function () {},
    search: function () {
      return Promise.resolve({
        results: [
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
        ],
      });
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
    search: function () {
      return Promise.resolve({
        results: [
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
        ],
      });
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
    search: function () {
      return Promise.resolve({
        results: [
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
        ],
      });
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
    search: function () {
      return Promise.resolve({
        results: [
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
        ],
      });
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

test('hides a facet value that is hidden according to `renderingContent`', function () {
  var fakeClient = {
    addAlgoliaAgent: function () {},
    search: function (requests) {
      if (requests[0].type === 'facet') {
        return Promise.resolve({
          results: [
            {
              exhaustiveFacetsCount: true,
              facetHits: [
                {
                  count: 1,
                  highlighted: 'hidden',
                  value: 'hidden',
                },
                {
                  count: 318,
                  highlighted: 'something',
                  value: 'something',
                },
              ],
              processingTimeMS: 3,
            },
          ],
        });
      }

      return Promise.resolve({
        results: [
          {
            index: 'index',
            renderingContent: {
              facetOrdering: {
                values: {
                  facet: {
                    hide: ['hidden'],
                  },
                },
              },
            },
          },
        ],
      });
    },
  };

  var helper = algoliasearchHelper(fakeClient, 'index', {
    disjunctiveFacets: ['facet'],
    renderingContent: {
      facetValues: [
        {
          name: 'something',
          isRefined: true,
        },
      ],
    },
  });

  return new Promise(function (res) {
    helper.search();
    helper.once('result', res);
  })
    .then(function () {
      return helper.searchForFacetValues('facet', 'k', 1);
    })
    .then(function (content) {
      expect(content).toEqual({
        exhaustiveFacetsCount: true,
        processingTimeMS: 3,
        facetHits: [
          {
            count: 318,
            highlighted: 'something',
            isRefined: false,
            escapedValue: 'something',
            value: 'something',
          },
        ],
      });
    });
});

test('does not hide if last results are for another index', function () {
  var fakeClient = {
    addAlgoliaAgent: function () {},
    search: function (requests) {
      if (requests[0].type === 'facet') {
        return Promise.resolve({
          results: [
            {
              exhaustiveFacetsCount: true,
              facetHits: [
                {
                  count: 1,
                  highlighted: 'hidden',
                  value: 'hidden',
                },
                {
                  count: 318,
                  highlighted: 'something',
                  value: 'something',
                },
              ],
              processingTimeMS: 3,
            },
          ],
        });
      }

      return Promise.resolve({
        results: [
          {
            index: 'index',
            renderingContent: {
              facetOrdering: {
                values: {
                  facet: {
                    hide: ['hidden'],
                  },
                },
              },
            },
          },
        ],
      });
    },
  };

  var helper = algoliasearchHelper(fakeClient, 'index', {
    disjunctiveFacets: ['facet'],
    renderingContent: {
      facetValues: [
        {
          name: 'something',
          isRefined: true,
        },
      ],
    },
  });

  return new Promise(function (res) {
    helper.search();
    helper.once('result', res);
  })
    .then(function () {
      return helper.searchForFacetValues('facet', 'k', 1, { index: 'index2' });
    })
    .then(function (content) {
      expect(content).toEqual({
        exhaustiveFacetsCount: true,
        processingTimeMS: 3,
        facetHits: [
          {
            count: 1,
            highlighted: 'hidden',
            isRefined: false,
            escapedValue: 'hidden',
            value: 'hidden',
          },
          {
            count: 318,
            highlighted: 'something',
            isRefined: false,
            escapedValue: 'something',
            value: 'something',
          },
        ],
      });
    });
});
