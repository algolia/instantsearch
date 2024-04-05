import type { RecommendQueriesResponse } from '@algolia/recommend';
import type {
  SearchResponse,
  SearchResponses,
  SearchForFacetValuesResponse,
  DefaultSearchClient,
} from 'instantsearch.js';

export const defaultRenderingContent: SearchResponse<any>['renderingContent'] =
  {
    facetOrdering: {
      facets: {
        order: ['brand', 'hierarchicalCategories.lvl0', 'categories'],
      },
      values: {
        brand: {
          sortRemainingBy: 'count',
        },
        categories: {
          sortRemainingBy: 'count',
        },
        'hierarchicalCategories.lvl0': {
          sortRemainingBy: 'count',
        },
      },
    },
  };

export const defaultUserData = [
  {
    title: 'Banner title',
    banner: 'https://banner.jpg',
    link: 'https://banner.com/link/',
  },
];

export const createSingleSearchResponse = <THit = any>(
  subset: Partial<SearchResponse<THit>> = {}
): SearchResponse<THit> => {
  const {
    query = '',
    page = 0,
    hitsPerPage = 20,
    hits = [],
    nbHits = hits.length,
    nbPages = Math.ceil(nbHits / hitsPerPage),
    params = '',
    exhaustiveNbHits = true,
    exhaustiveFacetsCount = true,
    processingTimeMS = 0,
    ...rest
  } = subset;

  return {
    page,
    hitsPerPage,
    nbHits,
    nbPages,
    processingTimeMS,
    hits,
    query,
    params,
    exhaustiveNbHits,
    exhaustiveFacetsCount,
    ...rest,
  };
};

export const createMultiSearchResponse = <THit = any>(
  ...args: Array<Partial<SearchResponse<THit>>>
): SearchResponses<THit> => {
  if (!args.length) {
    return {
      results: [createSingleSearchResponse()],
    };
  }

  return {
    results: args.map(createSingleSearchResponse),
  };
};

export const createSFFVResponse = (
  args: Partial<SearchForFacetValuesResponse> = {}
): SearchForFacetValuesResponse => ({
  facetHits: [],
  exhaustiveFacetsCount: true,
  processingTimeMS: 1,
  ...args,
});

type RecommendRequest = Parameters<
  DefaultSearchClient['getRecommendations']
>[0];

export const createRecommendResponse = (
  requests: RecommendRequest
): RecommendQueriesResponse<any> => {
  return { results: requests.map(() => createSingleSearchResponse()) };
};
