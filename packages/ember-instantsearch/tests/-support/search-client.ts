import type { SearchClient } from 'instantsearch.js';

interface Request {
  indexName: string;
  params?: Record<string, unknown>;
}

export interface Product {
  objectID: string;
  name: string;
  brand: string;
}

const records: Product[] = [
  { objectID: '1', name: 'iPhone', brand: 'Apple' },
  { objectID: '2', name: 'Galaxy', brand: 'Samsung' },
  { objectID: '3', name: 'iPad', brand: 'Apple' },
];

/**
 * Describes a request the way a test reads it,
 * for example `search instant_search query="i" page=1`.
 */
function describe(request: Request) {
  const params = request.params ?? {};
  const parts = [`search ${request.indexName}`];
  const keys = ['query', 'page', 'hitsPerPage', 'facets', 'facetFilters'];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]!;
    const value = params[key];

    if (value === undefined || value === '' || value === 0) continue;
    if (Array.isArray(value) && value.length === 0) continue;

    parts.push(`${key}=${JSON.stringify(value)}`);
  }

  return parts.join(' ');
}

function asksFor(facets: unknown, attribute: string) {
  return (
    facets === attribute ||
    (Array.isArray(facets) &&
      (facets.includes(attribute) || facets.includes('*')))
  );
}

/**
 * The brands in filters like `[["brand:Apple"]]`.
 */
function brandsIn(facetFilters: unknown) {
  const brands: string[] = [];
  const groups = Array.isArray(facetFilters) ? facetFilters : [];

  for (let i = 0; i < groups.length; i++) {
    const group = Array.isArray(groups[i]) ? groups[i] : [groups[i]];

    for (let j = 0; j < group.length; j++) {
      const filter = String(group[j]);

      if (filter.startsWith('brand:')) brands.push(filter.slice(6));
    }
  }

  return brands;
}

/**
 * A search client that answers from three records,
 * and records each request it gets in `steps`.
 *
 * The hits match the query by the start of their name,
 * with the match highlighted, and can be filtered by brand.
 */
export function createSearchClient(steps: string[]): SearchClient {
  return {
    search(requests: Request[]) {
      const results = [];

      for (let i = 0; i < requests.length; i++) {
        const request = requests[i]!;
        const params = request.params ?? {};
        const query = String(params['query'] ?? '');
        const hits = [];
        const brandCounts: Record<string, number> = {};
        const brandFilters = brandsIn(params['facetFilters']);

        steps.push(describe(request));

        for (let j = 0; j < records.length; j++) {
          const record = records[j]!;

          if (!record.name.toLowerCase().startsWith(query.toLowerCase())) {
            continue;
          }

          brandCounts[record.brand] = (brandCounts[record.brand] ?? 0) + 1;

          if (brandFilters.length > 0 && !brandFilters.includes(record.brand)) {
            continue;
          }

          hits.push(
            Object.assign({}, record, {
              _highlightResult: {
                name: {
                  value: query
                    ? `__ais-highlight__${record.name.slice(0, query.length)}__/ais-highlight__${record.name.slice(query.length)}`
                    : record.name,
                  matchLevel: query ? 'full' : 'none',
                  matchedWords: [],
                },
              },
            })
          );
        }

        const hitsPerPage = Number(params['hitsPerPage'] ?? 20);

        results.push({
          index: request.indexName,
          facets: asksFor(params['facets'], 'brand')
            ? { brand: brandCounts }
            : {},
          hits: hits.slice(0, hitsPerPage),
          nbHits: hits.length,
          page: Number(params['page'] ?? 0),
          nbPages: Math.max(1, Math.ceil(hits.length / hitsPerPage)),
          hitsPerPage,
          processingTimeMS: 1,
          exhaustiveNbHits: true,
          query,
          params: '',
        });
      }

      return Promise.resolve({ results });
    },
  } as unknown as SearchClient;
}
