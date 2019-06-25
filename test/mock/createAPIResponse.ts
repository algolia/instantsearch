import { SearchForFacetValues, Response, MultiResponse } from 'algoliasearch';

export const createSingleSearchResponse = (
  args: Partial<Response> = {}
): Response => ({
  hits: [],
  nbHits: 0,
  page: 0,
  nbPages: 0,
  hitsPerPage: 4,
  processingTimeMS: 1,
  query: '',
  params: '',
  index: 'index_name',
  ...args,
});

export const createMutliSearchResponse = (
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
