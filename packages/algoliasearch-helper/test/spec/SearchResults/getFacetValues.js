'use strict';

var SearchParameters = require('../../../src/SearchParameters');
var SearchResults = require('../../../src/SearchResults');

test('getFacetValues(facetName) returns a list of values using the defaults', function () {
  var data = require('./getFacetValues/disjunctive.json');
  var searchParams = new SearchParameters(data.state);
  var result = new SearchResults(searchParams, data.content.results);

  var facetValues = result.getFacetValues('brand');

  var expected = [
    { count: 386, isRefined: true, name: 'Apple', escapedValue: 'Apple' },
    {
      count: 551,
      isRefined: false,
      name: 'Insignia™',
      escapedValue: 'Insignia™',
    },
    { count: 511, isRefined: false, name: 'Samsung', escapedValue: 'Samsung' },
  ];

  expect(facetValues).toEqual(expected);
});

test('getFacetValues(facetName) when no order is specified for isRefined the order is descending', function () {
  var data = require('./getFacetValues/disjunctive.json');
  var searchParams = new SearchParameters(data.state);
  var result = new SearchResults(searchParams, data.content.results);

  var facetValues = result.getFacetValues('brand', {
    sortBy: ['isRefined'],
  });

  var expected = result.getFacetValues('brand', {
    sortBy: ['isRefined:desc'],
  });

  expect(facetValues).toEqual(expected);
});

test('getFacetValues(facetName) when no order is specified for count the order is descending', function () {
  var data = require('./getFacetValues/disjunctive.json');
  var searchParams = new SearchParameters(data.state);
  var result = new SearchResults(searchParams, data.content.results);

  var facetValues = result.getFacetValues('brand', {
    sortBy: ['count'],
  });

  var expected = result.getFacetValues('brand', {
    sortBy: ['count:desc'],
  });

  expect(facetValues).toEqual(expected);
});

test('getFacetValues(facetName) when no order is specified for name the order is ascending', function () {
  var data = require('./getFacetValues/disjunctive.json');
  var searchParams = new SearchParameters(data.state);
  var result = new SearchResults(searchParams, data.content.results);

  var facetValues = result.getFacetValues('brand', {
    sortBy: ['name'],
  });

  var expected = result.getFacetValues('brand', {
    sortBy: ['name:asc'],
  });

  expect(facetValues).toEqual(expected);
});

test('getFacetValues(facetName) testing the sort function', function () {
  var data = require('./getFacetValues/disjunctive.json');
  var searchParams = new SearchParameters(data.state);
  var result = new SearchResults(searchParams, data.content.results);

  var facetValues = result.getFacetValues('brand', {
    sortBy: function (a, b) {
      if (a.count === b.count) return 0;
      if (a.count > b.count) return 1;
      if (b.count > a.count) return -1;
      return undefined;
    },
  });

  var expected = result.getFacetValues('brand', {
    sortBy: ['count:asc'],
  });

  expect(facetValues).toEqual(expected);
});

test('getFacetValues(facetName) with disabled sorting', function () {
  var data = require('./getFacetValues/disjunctive.json');
  var searchParams = new SearchParameters(data.state);
  var result = new SearchResults(searchParams, data.content.results);

  var facetValues = result.getFacetValues('brand', {
    sortBy: function () {
      return 0;
    },
  });

  var expected = [
    {
      count: 551,
      isRefined: false,
      name: 'Insignia™',
      escapedValue: 'Insignia™',
    },
    { count: 511, isRefined: false, name: 'Samsung', escapedValue: 'Samsung' },
    { count: 386, isRefined: true, name: 'Apple', escapedValue: 'Apple' },
  ];

  expect(facetValues).toEqual(expected);
});

test('getFacetValues(conjunctive) returns correct facet values with the name `length`', function () {
  var searchParams = new SearchParameters({
    index: 'instant_search',
    facets: ['type'],
  });

  var result = {
    query: '',
    facets: {
      type: {
        dogs: 0,
        // the key length in an object makes it an array for lodash
        length: 5,
      },
    },
  };

  var results = new SearchResults(searchParams, [result, result]);

  var facetValues = results.getFacetValues('type');

  var expected = [
    {
      name: 'length',
      escapedValue: 'length',
      count: 5,
      isRefined: false,
      isExcluded: false,
    },
    {
      name: 'dogs',
      escapedValue: 'dogs',
      count: 0,
      isRefined: false,
      isExcluded: false,
    },
  ];

  expect(facetValues).toEqual(expected);
  expect(facetValues.length).toBe(2);
});

test('getFacetValues(disjunctive) returns correct facet values with the name `length`', function () {
  var searchParams = new SearchParameters({
    index: 'instant_search',
    disjunctiveFacets: ['type'],
  });

  var result = {
    query: '',
    facets: {
      type: {
        dogs: 0,
        // the key length in an object makes it an array for lodash
        length: 5,
      },
    },
  };

  var results = new SearchResults(searchParams, [result, result]);

  var facetValues = results.getFacetValues('type');

  var expected = [
    { name: 'length', escapedValue: 'length', count: 5, isRefined: false },
    { name: 'dogs', escapedValue: 'dogs', count: 0, isRefined: false },
  ];

  expect(facetValues).toEqual(expected);
  expect(facetValues.length).toBe(2);
});

test('getFacetValues(conjunctive) returns escaped facet values', function () {
  var searchParams = new SearchParameters({
    index: 'instant_search',
    facets: ['type'],
    facetsRefinements: {
      type: ['dogs', '\\-20%'],
    },
  });

  var result = {
    query: '',
    facets: {
      type: {
        dogs: 1,
        '-something': 5,
        '-20%': 2,
      },
    },
  };

  var results = new SearchResults(searchParams, [result, result]);

  var facetValues = results.getFacetValues('type');

  var expected = [
    {
      name: '-20%',
      escapedValue: '\\-20%',
      count: 2,
      isRefined: true,
      isExcluded: false,
    },
    {
      name: 'dogs',
      escapedValue: 'dogs',
      count: 1,
      isRefined: true,
      isExcluded: false,
    },
    {
      name: '-something',
      escapedValue: '\\-something',
      count: 5,
      isRefined: false,
      isExcluded: false,
    },
  ];

  expect(facetValues).toEqual(expected);
  expect(facetValues.length).toBe(3);
});

test('getFacetValues(disjunctive) returns escaped facet values', function () {
  var searchParams = new SearchParameters({
    index: 'instant_search',
    disjunctiveFacets: ['type'],
    disjunctiveFacetsRefinements: {
      type: ['dogs', '\\-20%'],
    },
  });

  var result = {
    query: '',
    facets: {
      type: {
        dogs: 1,
        '-something': 5,
        '-20%': 2,
      },
    },
  };

  var results = new SearchResults(searchParams, [result, result]);

  var facetValues = results.getFacetValues('type');

  var expected = [
    { name: '-20%', escapedValue: '\\-20%', count: 2, isRefined: true },
    { name: 'dogs', escapedValue: 'dogs', count: 1, isRefined: true },
    {
      name: '-something',
      escapedValue: '\\-something',
      count: 5,
      isRefined: false,
    },
  ];

  expect(facetValues).toEqual(expected);
  expect(facetValues.length).toBe(3);
});

test('getFacetValues introduces numeric disjunctive refinements', function () {
  var searchParams = new SearchParameters({
    index: 'instant_search',
    disjunctiveFacets: ['type'],
    disjunctiveFacetsRefinements: {
      type: ['5', 50],
    },
  });

  var result = {
    query: '',
    facets: {
      type: {},
    },
  };

  var results = new SearchResults(searchParams, [result, result]);

  var facetValues = results.getFacetValues('type');

  var expected = [
    { name: '5', escapedValue: '5', count: 0, isRefined: true },
    // even though this could be considered refined, it's not because it's a number (existing bug)
    { name: '50', escapedValue: '50', count: 0, isRefined: false },
  ];

  expect(facetValues).toEqual(expected);
  expect(facetValues.length).toBe(2);
});

test('getFacetValues(hierarchical) returns escaped facet values', function () {
  var searchParams = new SearchParameters({
    index: 'instant_search',
    hierarchicalFacets: [
      {
        name: 'type',
        attributes: ['type1', 'type2', 'type3'],
      },
    ],
    hierarchicalFacetsRefinements: { type: ['\\-something > discounts'] },
  });

  var result = {
    query: '',
    facets: {
      type1: {
        dogs: 1,
        '-something': 5,
      },
      type2: {
        'dogs > hounds': 1,
        '-something > discounts': 5,
      },
      type3: {
        '-something > discounts > -5%': 1,
        '-something > discounts > full price': 4,
      },
    },
    exhaustiveFacetsCount: true,
  };

  var results = new SearchResults(searchParams, [result, result, result]);

  var facetValues = results.getFacetValues('type');

  var expected = {
    data: [
      {
        count: 5,
        data: [
          {
            count: 5,
            data: [
              {
                count: 4,
                data: null,
                exhaustive: true,
                isRefined: false,
                name: 'full price',
                path: '-something > discounts > full price',
                escapedValue: '\\-something > discounts > full price',
              },
              {
                count: 1,
                data: null,
                exhaustive: true,
                isRefined: false,
                name: '-5%',
                path: '-something > discounts > -5%',
                escapedValue: '\\-something > discounts > -5%',
              },
            ],
            exhaustive: true,
            isRefined: true,
            name: 'discounts',
            path: '-something > discounts',
            escapedValue: '\\-something > discounts',
          },
        ],
        exhaustive: true,
        isRefined: true,
        name: '-something',
        path: '-something',
        escapedValue: '\\-something',
      },
      {
        count: 1,
        data: null,
        exhaustive: true,
        isRefined: false,
        name: 'dogs',
        path: 'dogs',
        escapedValue: 'dogs',
      },
    ],
    exhaustive: true,
    isRefined: true,
    name: 'type',
    path: null,
    escapedValue: null,
    count: null,
  };

  expect(facetValues).toEqual(expected);
});

test('getFacetValues(hierarchical) takes `rootPath` into account', function () {
  var searchParams = new SearchParameters({
    index: 'instant_search',
    hierarchicalFacets: [
      {
        name: 'type',
        attributes: ['type1', 'type2', 'type3'],
        rootPath: 'cats',
      },
    ],
    hierarchicalFacetsRefinements: { type: ['cats > british shorthair'] },
  });

  var result = {
    query: '',
    facets: {
      type1: {
        dogs: 1,
        cats: 8,
      },
      type2: {
        'dogs > hounds': 1,
        'cats > chartreux': 5,
        'cats > british shorthair': 4,
      },
      type3: {
        'cats > british shorthair > blue': 1,
        'cats > british shorthair > golden': 3,
      },
    },
    exhaustiveFacetsCount: true,
  };

  var results = new SearchResults(searchParams, [result, result, result]);

  var facetValues = results.getFacetValues('type');

  var expected = {
    data: [
      {
        count: 4,
        data: [
          {
            count: 3,
            data: null,
            escapedValue: 'cats > british shorthair > golden',
            exhaustive: true,
            isRefined: false,
            name: 'golden',
            path: 'cats > british shorthair > golden',
          },
          {
            count: 1,
            data: null,
            escapedValue: 'cats > british shorthair > blue',
            exhaustive: true,
            isRefined: false,
            name: 'blue',
            path: 'cats > british shorthair > blue',
          },
        ],
        escapedValue: 'cats > british shorthair',
        exhaustive: true,
        isRefined: true,
        name: 'british shorthair',
        path: 'cats > british shorthair',
      },
      {
        count: 5,
        data: null,
        escapedValue: 'cats > chartreux',
        exhaustive: true,
        isRefined: false,
        name: 'chartreux',
        path: 'cats > chartreux',
      },
    ],
    exhaustive: true,
    isRefined: true,
    name: 'type',
    path: null,
    escapedValue: null,
    count: null,
  };

  expect(facetValues).toEqual(expected);
});

test('getFacetValues(hierarchical) correctly sets `isRefined` on facet values with trailing spaces', function () {
  var searchParams = new SearchParameters({
    index: 'instant_search',
    hierarchicalFacets: [
      {
        name: 'type',
        attributes: ['type1', 'type2', 'type3'],
      },
    ],
    hierarchicalFacetsRefinements: { type: ['something > discounts '] },
  });

  var result = {
    query: '',
    facets: {
      type1: {
        dogs: 1,
        something: 5,
      },
      type2: {
        'dogs > hounds': 1,
        'something > discounts ': 5,
      },
      type3: {
        'something > discounts  > -5%': 1,
        'something > discounts  > full price': 4,
      },
    },
    exhaustiveFacetsCount: true,
  };

  var results = new SearchResults(searchParams, [result, result, result]);

  var facetValues = results.getFacetValues('type');

  expect(facetValues).toEqual(
    expect.objectContaining({
      name: 'type',
      isRefined: true,
      data: expect.arrayContaining([
        expect.objectContaining({
          name: 'something',
          isRefined: true,
          data: expect.arrayContaining([
            expect.objectContaining({
              name: 'discounts',
              isRefined: true,
            }),
          ]),
        }),
      ]),
    })
  );
});

test('getFacetValues(unknown) returns undefined (does not throw)', function () {
  var searchParams = new SearchParameters({
    index: 'instant_search',
  });

  var result = {
    query: '',
    // it does not matter if the result here is given or not,
    // if something is not a parameter, it will not be read.
    facets: {},
  };

  var results = new SearchResults(searchParams, [result, result]);

  expect(results.getFacetValues('type')).toBeUndefined();
});

test('getFacetValues(disjunctive) when current state is different to constructor state', function () {
  var data = require('./getFacetValues/disjunctive.json');
  var searchParams = new SearchParameters(data.state);
  var result = new SearchResults(searchParams, data.content.results);

  // set current state to something different than constructor
  result._state = result._state.addDisjunctiveFacetRefinement(
    'brand',
    'Samsung'
  );

  var facetValues = result.getFacetValues('brand');

  var expected = [
    { count: 511, isRefined: true, name: 'Samsung', escapedValue: 'Samsung' },
    { count: 386, isRefined: true, name: 'Apple', escapedValue: 'Apple' },
    {
      count: 551,
      isRefined: false,
      name: 'Insignia™',
      escapedValue: 'Insignia™',
    },
  ];

  expect(facetValues).toEqual(expected);
});

test('getFacetValues(conjunctive) when current state is different to constructor state', function () {
  var data = require('./getFacetValues/conjunctive.json');
  var searchParams = new SearchParameters(data.state);
  var result = new SearchResults(searchParams, data.content.results);

  // set current state to something different than constructor
  result._state = result._state.addFacetRefinement('brand', 'Samsung');

  var facetValues = result.getFacetValues('brand');

  var expected = [
    {
      count: 511,
      isRefined: true,
      isExcluded: false,
      name: 'Samsung',
      escapedValue: 'Samsung',
    },
    {
      count: 386,
      isRefined: true,
      isExcluded: false,
      name: 'Apple',
      escapedValue: 'Apple',
    },
    {
      count: 551,
      isRefined: false,
      isExcluded: false,
      name: 'Insignia™',
      escapedValue: 'Insignia™',
    },
  ];

  expect(facetValues).toEqual(expected);
});

test('getFacetValues(hierarchical) when current state is different to constructor state', function () {
  var searchParams = new SearchParameters({
    index: 'instant_search',
    hierarchicalFacets: [
      {
        name: 'type',
        attributes: ['type1', 'type2', 'type3'],
      },
    ],
    hierarchicalFacetsRefinements: { type: ['\\-something > discounts'] },
  });

  var result = {
    query: '',
    facets: {
      type1: {
        dogs: 1,
        '-something': 5,
      },
      type2: {
        'dogs > hounds': 1,
        '-something > discounts': 5,
      },
      type3: {
        '-something > discounts > -5%': 1,
        '-something > discounts > full price': 4,
      },
    },
    exhaustiveFacetsCount: true,
  };

  var results = new SearchResults(searchParams, [result, result, result]);
  results._state = results._state
    .removeHierarchicalFacetRefinement('type')
    .addHierarchicalFacetRefinement('type', '\\-something > discounts > -5%');

  var facetValues = results.getFacetValues('type');

  var expected = {
    data: [
      {
        count: 5,
        data: [
          {
            count: 5,
            data: [
              {
                count: 1,
                data: null,
                exhaustive: true,
                isRefined: true,
                name: '-5%',
                path: '-something > discounts > -5%',
                escapedValue: '\\-something > discounts > -5%',
              },
              {
                count: 4,
                data: null,
                exhaustive: true,
                isRefined: false,
                name: 'full price',
                path: '-something > discounts > full price',
                escapedValue: '\\-something > discounts > full price',
              },
            ],
            exhaustive: true,
            isRefined: true,
            name: 'discounts',
            path: '-something > discounts',
            escapedValue: '\\-something > discounts',
          },
        ],
        exhaustive: true,
        isRefined: true,
        name: '-something',
        path: '-something',
        escapedValue: '\\-something',
      },
      {
        count: 1,
        data: null,
        exhaustive: true,
        isRefined: false,
        name: 'dogs',
        path: 'dogs',
        escapedValue: 'dogs',
      },
    ],
    exhaustive: true,
    isRefined: true,
    name: 'type',
    path: null,
    escapedValue: null,
    count: null,
  };

  expect(facetValues).toEqual(expected);
});
