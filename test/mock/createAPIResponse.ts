import { SearchForFacetValues, Response, MultiResponse } from 'algoliasearch';

export function createSingleSearchResponse<THit = any>(
  subset: Partial<Response<THit>> = {}
): Response<THit> {
  const {
    page = 0,
    hitsPerPage = 20,
    nbHits = 0,
    nbPages,
    processingTimeMS = 0,
    hits = [],
    query = '',
    params = '',
    exhaustiveNbHits = true,
    exhaustiveFacetsCount = true,
    ...rest
  } = subset;
  const fallbackNbPages =
    nbPages !== undefined ? nbPages : Math.ceil(nbHits / hitsPerPage);
  return {
    page,
    hitsPerPage,
    nbHits,
    nbPages: fallbackNbPages,
    processingTimeMS,
    hits,
    query,
    params,
    exhaustiveNbHits,
    exhaustiveFacetsCount,
    ...rest,
  };
}

export const createMultiSearchResponse = (
  ...args: Array<Partial<Response>>
): MultiResponse => {
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
  args: Partial<SearchForFacetValues.Response> = {}
): SearchForFacetValues.Response => ({
  facetHits: [],
  exhaustiveFacetsCount: true,
  processingTimeMS: 1,
  ...args,
});
