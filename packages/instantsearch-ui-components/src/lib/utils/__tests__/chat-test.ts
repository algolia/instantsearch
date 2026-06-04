import { getFacetFiltersFromToolInput } from '../chat';

describe('getFacetFiltersFromToolInput', () => {
  test('returns undefined when input is undefined', () => {
    expect(getFacetFiltersFromToolInput(undefined)).toBeUndefined();
  });

  test('returns the standard `facet_filters` array when present', () => {
    const facetFilters = [['brand:Apple'], ['type:book']];

    expect(
      getFacetFiltersFromToolInput({
        query: 'phone',
        facet_filters: facetFilters,
      })
    ).toBe(facetFilters);
  });

  test('builds facet filters from MCP `facet_<attribute>` keys', () => {
    expect(
      getFacetFiltersFromToolInput({
        query: '',
        clickAnalytics: true,
        facet_type: ['book'],
        facet_brand: [],
        facet_title: [],
        facet_author: [],
        facet_categories: [
          'Literature & Fiction',
          'Mystery, Thriller & Suspense',
          'Teen & Young Adult',
        ],
        facet__collections: [],
        facet_price: [],
        userIntent: 'irrelevant',
      } as Parameters<typeof getFacetFiltersFromToolInput>[0])
    ).toEqual([
      ['type:book'],
      [
        'categories:Literature & Fiction',
        'categories:Mystery, Thriller & Suspense',
        'categories:Teen & Young Adult',
      ],
    ]);
  });

  test('preserves the attribute name including leading underscores', () => {
    expect(
      getFacetFiltersFromToolInput({
        query: '',
        facet__collections: ['summer'],
      } as Parameters<typeof getFacetFiltersFromToolInput>[0])
    ).toEqual([['_collections:summer']]);
  });

  test('ignores non-string and empty facet values', () => {
    expect(
      getFacetFiltersFromToolInput({
        query: '',
        facet_brand: [],
        facet_type: [42, 'book', null] as unknown as string[],
      } as Parameters<typeof getFacetFiltersFromToolInput>[0])
    ).toEqual([['type:book']]);
  });

  test('returns undefined when there are no facet refinements', () => {
    expect(
      getFacetFiltersFromToolInput({
        query: 'phone',
        facet_brand: [],
        facet_type: [],
      } as Parameters<typeof getFacetFiltersFromToolInput>[0])
    ).toBeUndefined();
  });
});
