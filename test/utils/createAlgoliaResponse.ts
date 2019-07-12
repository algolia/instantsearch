import { Response } from 'algoliasearch';

/**
 * Create a response conforming a real Algolia response from a subset of it.
 * Only parameters which always return are given a default value.
 *
 * If not given, nbPages is computed from nbHits & hitsPerPage
 */
export default function createAlgoliaResponse<THit = any>(
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
    ...rest,
  };
}
