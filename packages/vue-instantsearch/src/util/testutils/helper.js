export const createSerializedState = () => ({
  lastResults: {
    _rawResults: [
      {
        hits: [
          {
            objectID: 'doggos',
            name: 'the dog',
          },
        ],
        nbHits: 1071,
        page: 0,
        nbPages: 200,
        hitsPerPage: 5,
        processingTimeMS: 3,
        facets: {
          genre: {
            Comedy: 1071,
            Drama: 290,
            Romance: 202,
          },
        },
        exhaustiveFacetsCount: true,
        exhaustiveNbHits: true,
        query: 'hi',
        queryAfterRemoval: 'hi',
        params:
          'query=hi&hitsPerPage=5&page=0&highlightPreTag=__ais-highlight__&highlightPostTag=__%2Fais-highlight__&facets=%5B%22genre%22%5D&tagFilters=&facetFilters=%5B%5B%22genre%3AComedy%22%5D%5D',
        index: 'movies',
      },
      {
        hits: [{ objectID: 'doggos' }],
        nbHits: 5131,
        page: 0,
        nbPages: 1000,
        hitsPerPage: 1,
        processingTimeMS: 7,
        facets: {
          genre: {
            Comedy: 1071,
            Drama: 1642,
            Romance: 474,
          },
        },
        exhaustiveFacetsCount: true,
        exhaustiveNbHits: true,
        query: 'hi',
        queryAfterRemoval: 'hi',
        params:
          'query=hi&hitsPerPage=1&page=0&highlightPreTag=__ais-highlight__&highlightPostTag=__%2Fais-highlight__&attributesToRetrieve=%5B%5D&attributesToHighlight=%5B%5D&attributesToSnippet=%5B%5D&tagFilters=&analytics=false&clickAnalytics=false&facets=genre',
        index: 'movies',
      },
    ],
    query: 'hi',
    hits: [
      {
        objectID: 'doggos',
        name: 'the dog',
      },
    ],
    index: 'movies',
    hitsPerPage: 5,
    nbHits: 1071,
    nbPages: 200,
    page: 0,
    processingTimeMS: 10,
    exhaustiveFacetsCount: true,
    exhaustiveNbHits: true,
    disjunctiveFacets: [
      {
        name: 'genre',
        data: {
          Comedy: 1071,
          Drama: 1642,
          Romance: 474,
        },
        exhaustive: true,
      },
    ],
    hierarchicalFacets: [],
    facets: [],
    _state: {
      index: 'movies',
      query: 'hi',
      facets: [],
      disjunctiveFacets: ['genre'],
      hierarchicalFacets: [],
      facetsRefinements: {},
      facetsExcludes: {},
      disjunctiveFacetsRefinements: { genre: ['Comedy'] },
      numericRefinements: {},
      tagRefinements: [],
      hierarchicalFacetsRefinements: {},
      hitsPerPage: 5,
      page: 0,
      highlightPreTag: '__ais-highlight__',
      highlightPostTag: '__/ais-highlight__',
    },
  },
});
