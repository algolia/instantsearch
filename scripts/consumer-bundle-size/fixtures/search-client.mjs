export const searchClient = {
  search(requests) {
    return Promise.resolve({
      results: requests.map(() => ({
        hits: [],
        nbHits: 0,
        page: 0,
        nbPages: 0,
        hitsPerPage: 20,
        processingTimeMS: 0,
        exhaustiveNbHits: true,
        exhaustiveFacetsCount: true,
        query: '',
        params: '',
      })),
    });
  },
  searchForFacetValues(requests) {
    return Promise.resolve(
      requests.map(() => ({
        facetHits: [],
        exhaustiveFacetsCount: true,
        processingTimeMS: 0,
      }))
    );
  },
};
