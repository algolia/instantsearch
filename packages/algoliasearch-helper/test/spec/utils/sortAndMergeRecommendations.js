'use strict';

var sortAndMergeRecommendations = require('../../../src/utils/sortAndMergeRecommendations');

var response = {
  results: [
    {
      exhaustiveNbHits: true,
      hits: [
        {
          objectID: 'A',
          name: 'Product A',
          _score: 100,
        },
        {
          objectID: 'B',
          name: 'Product B',
          _score: 0,
        },
        {
          objectID: 'C',
          name: 'Product C',
          _score: 0,
        },
        {
          objectID: 'D',
          name: 'Product D',
          _score: 89,
        },
        {
          objectID: 'E',
          name: 'Product E',
          _score: 76,
        },
      ],
      hitsPerPage: 10,
      nbHits: 10,
      nbPages: 1,
      page: 0,
      processingTimeMS: 1,
    },
    {
      exhaustiveNbHits: true,
      hits: [
        {
          objectID: 'F',
          name: 'Product F',
          _score: 100,
        },
        {
          objectID: 'B',
          name: 'Product B',
          _score: 0,
        },
        {
          objectID: 'E',
          name: 'Product E',
          _score: 0,
        },
        {
          objectID: 'G',
          name: 'Product G',
          _score: 96,
        },
        {
          objectID: 'C',
          name: 'Product C',
          _score: 0,
        },
      ],
      hitsPerPage: 10,
      nbHits: 10,
      nbPages: 1,
      page: 0,
      processingTimeMS: 1,
    },
  ],
};

test('sorts the items based on their average index thus preserving applied rules', () => {
  const result = sortAndMergeRecommendations(
    ['X', 'Y', 'Z'],
    response.results.map(function (res) {
      return res.hits;
    })
  );

  expect(result).toMatchInlineSnapshot(`
    [
      {
        "_score": 0,
        "name": "Product B",
        "objectID": "B",
      },
      {
        "_score": 76,
        "name": "Product E",
        "objectID": "E",
      },
      {
        "_score": 0,
        "name": "Product C",
        "objectID": "C",
      },
      {
        "_score": 100,
        "name": "Product F",
        "objectID": "F",
      },
      {
        "_score": 100,
        "name": "Product A",
        "objectID": "A",
      },
      {
        "_score": 96,
        "name": "Product G",
        "objectID": "G",
      },
      {
        "_score": 89,
        "name": "Product D",
        "objectID": "D",
      },
    ]
  `);
});

test('filters out input objectIDs', () => {
  const result = sortAndMergeRecommendations(
    ['A', 'B', 'C'],
    response.results.map(function (res) {
      return res.hits;
    })
  );

  expect(result).toMatchInlineSnapshot(`
    [
      {
        "_score": 76,
        "name": "Product E",
        "objectID": "E",
      },
      {
        "_score": 100,
        "name": "Product F",
        "objectID": "F",
      },
      {
        "_score": 96,
        "name": "Product G",
        "objectID": "G",
      },
      {
        "_score": 89,
        "name": "Product D",
        "objectID": "D",
      },
    ]
  `);
});
