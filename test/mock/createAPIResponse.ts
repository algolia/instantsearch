import type {
  SearchForFacetValuesResponse,
  SearchResponse,
} from '@algolia/client-search';

export function createSingleSearchResponse<THit = any>(
  options: Partial<SearchResponse<THit>> = {}
): SearchResponse<THit> {
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
    renderingContent = {
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
    },
    userData = [
      {
        title: 'Banner title',
        banner: 'https://banner.jpg',
        link: 'https://banner.com/link/',
      },
    ],
    ...rest
  } = options;

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
    renderingContent,
    userData,
    ...rest,
  };
}

type MultiResponse<THit = any> = {
  results: Array<SearchResponse<THit>>;
};

export function createMultiSearchResponse<THit = any>(
  ...args: Array<Partial<SearchResponse<THit>>>
): MultiResponse {
  if (!args.length) {
    return {
      results: [createSingleSearchResponse()],
    };
  }

  return {
    results: args.map(createSingleSearchResponse),
  };
}

export function createSFFVResponse(
  options: Partial<SearchForFacetValuesResponse> = {}
): SearchForFacetValuesResponse {
  return {
    facetHits: [],
    exhaustiveFacetsCount: true,
    processingTimeMS: 1,
    ...options,
  };
}
