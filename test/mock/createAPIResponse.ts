import { SearchForFacetValues, Response, MultiResponse } from 'algoliasearch';

export const createSingleSearchResponse = <THit = any>(
  subset: Partial<Response<THit>> = {}
): Response<THit> => {
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
