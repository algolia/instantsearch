'use strict';

var SearchParameters = require('../../../src/SearchParameters');

module.exports = getData;

function getData() {
  var response = {
    results: [
      {
        page: 0,
        index: 'test_hotels-node',
        hits: [
          {
            stars: '****',
            facilities: ['spa'],
            city: 'New York',
            objectID: '366084010',
            name: 'Hotel E',
            _highlightResult: {
              name: {
                matchedWords: [],
                value: 'Hotel E',
                matchLevel: 'none',
              },
              stars: {
                matchLevel: 'none',
                matchedWords: [],
                value: '****',
              },
              facilities: [
                {
                  matchLevel: 'none',
                  value: 'spa',
                  matchedWords: [],
                },
              ],
              city: {
                matchLevel: 'none',
                value: 'New York',
                matchedWords: [],
              },
            },
          },
          {
            _highlightResult: {
              stars: {
                matchedWords: [],
                value: '****',
                matchLevel: 'none',
              },
              facilities: [
                {
                  value: 'spa',
                  matchedWords: [],
                  matchLevel: 'none',
                },
              ],
              city: {
                matchedWords: [],
                value: 'Paris',
                matchLevel: 'none',
              },
              name: {
                value: 'Hotel D',
                matchedWords: [],
                matchLevel: 'none',
              },
            },
            name: 'Hotel D',
            objectID: '366084000',
            facilities: ['spa'],
            city: 'Paris',
            stars: '****',
          },
          {
            _highlightResult: {
              stars: {
                matchLevel: 'none',
                value: '*',
                matchedWords: [],
              },
              city: {
                matchLevel: 'none',
                value: 'Paris',
                matchedWords: [],
              },
              facilities: [
                {
                  value: 'wifi',
                  matchedWords: [],
                  matchLevel: 'none',
                },
              ],
              name: {
                matchedWords: [],
                value: 'Hotel B',
                matchLevel: 'none',
              },
            },
            name: 'Hotel B',
            objectID: '366083980',
            city: 'Paris',
            facilities: ['wifi'],
            stars: '*',
          },
          {
            stars: '*',
            city: 'Paris',
            facilities: ['wifi', 'bath', 'spa'],
            objectID: '366083970',
            name: 'Hotel A',
            _highlightResult: {
              name: {
                value: 'Hotel A',
                matchedWords: [],
                matchLevel: 'none',
              },
              stars: {
                matchLevel: 'none',
                value: '*',
                matchedWords: [],
              },
              facilities: [
                {
                  matchLevel: 'none',
                  value: 'wifi',
                  matchedWords: [],
                },
                {
                  value: 'bath',
                  matchedWords: [],
                  matchLevel: 'none',
                },
                {
                  matchLevel: 'none',
                  matchedWords: [],
                  value: 'spa',
                },
              ],
              city: {
                matchLevel: 'none',
                matchedWords: [],
                value: 'Paris',
              },
            },
          },
        ],
        params:
          'query=&hitsPerPage=20&page=0&facets=%5B%5D&facetFilters=%5B%5B%22city%3AParis%22%2C%22city%3ANew%20York%22%5D%5D',
        exhaustiveFacetsCount: true,
        exhaustiveNbHits: true,
        nbHits: 4,
        query: '',
        processingTimeMS: 2,
        nbPages: 1,
        hitsPerPage: 20,
      },
      {
        query: '',
        nbPages: 5,
        hitsPerPage: 1,
        processingTimeMS: 3,
        page: 0,
        index: 'test_hotels-node',
        facets: {
          city: {
            'New York': 1,
            Paris: 3,
            'San Francisco': 1,
          },
        },
        exhaustiveFacetsCount: false,
        exhaustiveNbHits: true,
        nbHits: 5,
        hits: [
          {
            objectID: '366084010',
          },
        ],
        params:
          'query=&hitsPerPage=1&page=0&attributesToRetrieve=%5B%5D&attributesToHighlight=%5B%5D&attributesToSnippet=%5B%5D&facets=city&facetFilters=%5B%5D',
      },
    ],
  };

  var searchParams = new SearchParameters({
    index: 'test_hotels-node',
    disjunctiveFacets: ['city'],
    disjunctiveFacetsRefinements: {
      city: ['Paris', 'New York'],
    },
  });

  var responseHelper = {
    _rawResults: response.results.slice(0),
    _state: searchParams,
    query: '',
    hits: [
      {
        stars: '****',
        facilities: ['spa'],
        city: 'New York',
        objectID: '366084010',
        name: 'Hotel E',
        _highlightResult: {
          name: {
            matchedWords: [],
            value: 'Hotel E',
            matchLevel: 'none',
          },
          stars: {
            matchLevel: 'none',
            matchedWords: [],
            value: '****',
          },
          facilities: [
            {
              matchLevel: 'none',
              value: 'spa',
              matchedWords: [],
            },
          ],
          city: {
            matchLevel: 'none',
            value: 'New York',
            matchedWords: [],
          },
        },
      },
      {
        _highlightResult: {
          stars: {
            matchedWords: [],
            value: '****',
            matchLevel: 'none',
          },
          facilities: [
            {
              value: 'spa',
              matchedWords: [],
              matchLevel: 'none',
            },
          ],
          city: {
            matchedWords: [],
            value: 'Paris',
            matchLevel: 'none',
          },
          name: {
            value: 'Hotel D',
            matchedWords: [],
            matchLevel: 'none',
          },
        },
        name: 'Hotel D',
        objectID: '366084000',
        facilities: ['spa'],
        city: 'Paris',
        stars: '****',
      },
      {
        _highlightResult: {
          stars: {
            matchLevel: 'none',
            value: '*',
            matchedWords: [],
          },
          city: {
            matchLevel: 'none',
            value: 'Paris',
            matchedWords: [],
          },
          facilities: [
            {
              value: 'wifi',
              matchedWords: [],
              matchLevel: 'none',
            },
          ],
          name: {
            matchedWords: [],
            value: 'Hotel B',
            matchLevel: 'none',
          },
        },
        name: 'Hotel B',
        objectID: '366083980',
        city: 'Paris',
        facilities: ['wifi'],
        stars: '*',
      },
      {
        stars: '*',
        city: 'Paris',
        facilities: ['wifi', 'bath', 'spa'],
        objectID: '366083970',
        name: 'Hotel A',
        _highlightResult: {
          name: {
            value: 'Hotel A',
            matchedWords: [],
            matchLevel: 'none',
          },
          stars: {
            matchLevel: 'none',
            value: '*',
            matchedWords: [],
          },
          facilities: [
            {
              matchLevel: 'none',
              value: 'wifi',
              matchedWords: [],
            },
            {
              value: 'bath',
              matchedWords: [],
              matchLevel: 'none',
            },
            {
              matchLevel: 'none',
              matchedWords: [],
              value: 'spa',
            },
          ],
          city: {
            matchLevel: 'none',
            matchedWords: [],
            value: 'Paris',
          },
        },
      },
    ],
    index: 'test_hotels-node',
    hitsPerPage: 20,
    nbHits: 4,
    nbPages: 1,
    page: 0,
    params:
      'query=&hitsPerPage=20&page=0&facets=%5B%5D&facetFilters=%5B%5B%22city%3AParis%22%2C%22city%3ANew%20York%22%5D%5D',
    processingTimeMS: 5,
    disjunctiveFacets: [
      {
        name: 'city',
        data: {
          'New York': 1,
          Paris: 3,
          'San Francisco': 1,
        },
        exhaustive: false,
      },
    ],
    hierarchicalFacets: [],
    facets: [],
    exhaustiveFacetsCount: true,
    exhaustiveNbHits: true,
  };

  return {
    response: response,
    searchParams: searchParams,
    responseHelper: responseHelper,
  };
}
