'use strict';

var algoliasearchHelper = require('../../../index');

function makeFakeSearchForFacetValuesResponse() {
  return {
    exhaustiveFacetsCount: true,
    facetHits: [],
    processingTimeMS: 3,
  };
}

test('searchForFacetValues calls client.search if client.searchForFacets exists', function () {
  var fakeClient = {
    initIndex: function () {
      return {
        searchForFacetValues: jest.fn(function () {}),
      };
    },
    searchForFacets: jest.fn(),
    searchForFacetValues: jest.fn(),
    search: jest.fn(function () {
      return Promise.resolve({
        results: [makeFakeSearchForFacetValuesResponse()],
      });
    }),
  };

  var helper = algoliasearchHelper(fakeClient, 'index');

  return helper.searchForFacetValues('facet', 'query', 1).then(function () {
    expect(fakeClient.search).toHaveBeenCalledTimes(1);
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

test('searchForFacetValues should search for facetValues with the current state', function () {
  var fakeClient = {
    addAlgoliaAgent: function () {},
    search: jest.fn(function () {
      return Promise.resolve({
        results: [makeFakeSearchForFacetValuesResponse()],
      });
    }),
  };

  var helper = algoliasearchHelper(fakeClient, 'index', {
    highlightPreTag: 'HIGHLIGHT>',
    highlightPostTag: '<HIGHLIGHT',
    query: 'iphone',
  });

  helper.searchForFacetValues('facet', 'query', 75);

  var lastArguments = fakeClient.search.mock.calls[0][0][0];

  expect(lastArguments.params.query).toBe('iphone');
  expect(lastArguments.params.facetQuery).toBe('query');
  expect(lastArguments.facet).toBe('facet');
  expect(lastArguments.params.highlightPreTag).toBe('HIGHLIGHT>');
  expect(lastArguments.params.highlightPostTag).toBe('<HIGHLIGHT');
});

test('searchForFacetValues can override the current search state', function () {
  var fakeClient = {
    search: jest.fn(function () {
      return Promise.resolve({
        results: [makeFakeSearchForFacetValuesResponse()],
      });
    }),
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

  var lastArguments = fakeClient.search.mock.calls[0][0][0];

  expect(lastArguments.params.hasOwnProperty('query')).toBeFalsy();
  expect(lastArguments.params.facetQuery).toBe('query');
  expect(lastArguments.facet).toBe('facet');
  expect(lastArguments.params.highlightPreTag).toBe('highlightTag');
  expect(lastArguments.params.highlightPostTag).toBe('<HIGHLIGHT');
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
    search: function () {
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
    searchForFacetValues: function () {
      return Promise.resolve([
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
      ]);
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
    search: function () {
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
    searchForFacetValues: function () {
      return Promise.resolve([
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
      ]);
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
