import { warnCache } from '../../../warn';
import {
  findTool,
  getApplyFiltersParamsFromToolInput,
  getResolvedSearchParams,
} from '../chat';
import { startsWith } from '../startsWith';

describe('getApplyFiltersParamsFromToolInput', () => {
  test('returns nothing to refine when input is undefined', () => {
    expect(getApplyFiltersParamsFromToolInput(undefined)).toEqual({
      query: undefined,
      facetFilters: undefined,
    });
  });

  test('returns the query and the standard `facet_filters` array', () => {
    const facetFilters = [['brand:Apple'], ['type:book']];

    expect(
      getApplyFiltersParamsFromToolInput({
        query: 'phone',
        facet_filters: facetFilters,
      })
    ).toEqual({ query: 'phone', facetFilters });
  });

  test('builds facet filters from MCP `facet_<attribute>` keys', () => {
    expect(
      getApplyFiltersParamsFromToolInput({
        query: 'book',
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
      })
    ).toEqual({
      query: 'book',
      facetFilters: [
        ['type:book'],
        [
          'categories:Literature & Fiction',
          'categories:Mystery, Thriller & Suspense',
          'categories:Teen & Young Adult',
        ],
      ],
    });
  });

  test('reads the query and the facets of the first entry of a `queries` input', () => {
    expect(
      getApplyFiltersParamsFromToolInput({
        queries: [
          {
            query: 'laptop',
            facet_free_shipping: null,
            facet_brand: null,
            facet_categories: ['Laptops'],
            'facet_hierarchicalCategories.lvl0': ['Computers & Tablets'],
            'facet_hierarchicalCategories.lvl1': [
              'Computers & Tablets > Laptops',
            ],
            'facet_hierarchicalCategories.lvl2': null,
            facet_price: null,
          },
          { query: 'ignored', facet_brand: ['Apple'] },
        ],
        clickAnalytics: true,
        originalQuery: 'give me some laptops',
      })
    ).toEqual({
      query: 'laptop',
      facetFilters: [
        ['categories:Laptops'],
        ['hierarchicalCategories.lvl0:Computers & Tablets'],
        ['hierarchicalCategories.lvl1:Computers & Tablets > Laptops'],
      ],
    });
  });

  test('returns nothing to refine when `queries` is empty', () => {
    expect(getApplyFiltersParamsFromToolInput({ queries: [] })).toEqual({
      query: undefined,
      facetFilters: undefined,
    });
  });

  test('preserves the attribute name including leading underscores', () => {
    expect(
      getApplyFiltersParamsFromToolInput({
        query: '',
        facet__collections: ['summer'],
      }).facetFilters
    ).toEqual([['_collections:summer']]);
  });

  test('ignores non-string and empty facet values', () => {
    expect(
      getApplyFiltersParamsFromToolInput({
        query: '',
        facet_brand: [],
        facet_type: [42, 'book', null],
      }).facetFilters
    ).toEqual([['type:book']]);
  });

  test('returns no facet filters when there are no refinements', () => {
    expect(
      getApplyFiltersParamsFromToolInput({
        query: 'phone',
        facet_brand: [],
        facet_type: [],
      }).facetFilters
    ).toBeUndefined();
  });

  test('builds a facet filter from an MCP boolean facet', () => {
    expect(
      getApplyFiltersParamsFromToolInput({
        query: 'phone',
        facet_inStock: true,
      })
    ).toEqual({
      query: 'phone',
      facetFilters: [['inStock:true']],
    });
  });

  test('skips a numeric facet instead of refining on the operator string', () => {
    expect(
      getApplyFiltersParamsFromToolInput({
        query: 'phone',
        facet_brand: ['Apple'],
        facet_price: ['<=1500', '>=500'],
      })
    ).toEqual({
      query: 'phone',
      facetFilters: [['brand:Apple']],
    });
  });

  test('keeps a string facet whose values are not numeric operators', () => {
    expect(
      getApplyFiltersParamsFromToolInput({
        query: '',
        facet_size: ['XL', 'L'],
      })
    ).toEqual({
      query: '',
      facetFilters: [['size:XL', 'size:L']],
    });
  });

  test('prefers the resolved search params over the raw facet keys', () => {
    expect(
      getApplyFiltersParamsFromToolInput(
        {
          query: 'phone',
          facet_brand: ['Apple'],
          facet_price: ['<=1500'],
        },
        {
          query: 'phone',
          facetFilters: [['brand:Apple']],
          numericFilters: ['price <= 1500'],
        }
      )
    ).toEqual({
      query: 'phone',
      facetFilters: [['brand:Apple']],
      numericFilters: ['price <= 1500'],
    });
  });

  test('keeps the tool input query when the resolved params omit it', () => {
    expect(
      getApplyFiltersParamsFromToolInput(
        { query: 'phone', facet_price: ['<=1500'] },
        { numericFilters: ['price <= 1500'] }
      )
    ).toEqual({
      query: 'phone',
      facetFilters: undefined,
      numericFilters: ['price <= 1500'],
    });
  });

  test('falls back to skipping numeric facets when resolved params are absent', () => {
    expect(
      getApplyFiltersParamsFromToolInput({
        query: 'phone',
        facet_price: ['<=1500'],
      })
    ).toEqual({
      query: 'phone',
      facetFilters: undefined,
    });
  });

  // Payload copied from the Algolia MCP Server's own test:
  // mcp-server/src/tools/search/__tests__/algoliaSearchSingleIndexTool.test.ts:135-170
  test('maps the MCP payload, dropping what this shape cannot express', () => {
    expect(
      getApplyFiltersParamsFromToolInput({
        query: 'phone',
        facet_brand: ['Samsung', 'Apple'],
        facet_price: ['<=1500', '>=500'],
        facet_rating: ['>=3', '<=5'],
        facet_category: ['Electronics'],
        facet_inStock: true,
      })
    ).toEqual({
      query: 'phone',
      facetFilters: [
        ['brand:Samsung', 'brand:Apple'],
        ['category:Electronics'],
        ['inStock:true'],
      ],
    });
  });
});

describe('getResolvedSearchParams', () => {
  const metadataPart = (toolCallId: string, resolved: unknown) => ({
    type: 'data-tool-output-metadata',
    data: {
      toolCallId,
      metadata: { 'com.algolia/resolved-search-params': resolved },
    },
  });

  test('reads the params matching the tool call', () => {
    const messages = [
      {
        parts: [
          { type: 'text', text: 'here you go' },
          metadataPart('call-1', {
            query: 'shoes',
            facetFilters: [['brand:Nike']],
            numericFilters: ['price <= 100'],
          }),
        ],
      },
    ];

    expect(getResolvedSearchParams(messages, 'call-1')).toEqual({
      query: 'shoes',
      facetFilters: [['brand:Nike']],
      numericFilters: ['price <= 100'],
    });
  });

  test('ignores metadata belonging to another tool call', () => {
    const messages = [
      {
        parts: [metadataPart('call-other', { numericFilters: ['price <= 1'] })],
      },
    ];

    expect(getResolvedSearchParams(messages, 'call-1')).toBeUndefined();
  });

  test('prefers the newest metadata for a re-answered tool call', () => {
    const messages = [
      { parts: [metadataPart('call-1', { numericFilters: ['price <= 100'] })] },
      { parts: [metadataPart('call-1', { numericFilters: ['price <= 50'] })] },
    ];

    expect(getResolvedSearchParams(messages, 'call-1')?.numericFilters).toEqual(
      ['price <= 50']
    );
  });

  test('returns nothing without messages or a tool call id', () => {
    expect(getResolvedSearchParams(undefined, 'call-1')).toBeUndefined();
    expect(getResolvedSearchParams([], 'call-1')).toBeUndefined();
    expect(
      getResolvedSearchParams(
        [{ parts: [metadataPart('call-1', { query: 'x' })] }],
        undefined
      )
    ).toBeUndefined();
  });

  test('drops values that are not the expected shape', () => {
    const messages = [
      {
        parts: [
          metadataPart('call-1', {
            query: 42,
            facetFilters: [['brand:Nike'], 'not-a-group'],
            numericFilters: 'price <= 100',
          }),
        ],
      },
    ];

    expect(getResolvedSearchParams(messages, 'call-1')).toEqual({
      query: undefined,
      facetFilters: [['brand:Nike']],
      numericFilters: undefined,
    });
  });

  test('treats an empty resolved list as absent', () => {
    const messages = [
      {
        parts: [
          metadataPart('call-1', { facetFilters: [], numericFilters: [] }),
        ],
      },
    ];

    expect(getResolvedSearchParams(messages, 'call-1')).toEqual({
      query: undefined,
      facetFilters: undefined,
      numericFilters: undefined,
    });
  });
});

describe('findTool', () => {
  const foo = { name: 'foo' };
  const fooBar = { name: 'foo_bar' };
  // Claims index-suffixed names, like the MCP Server's search tool.
  const suffixedFoo = {
    name: 'foo',
    matchesToolName: (toolName: string) => startsWith(toolName, 'foo_'),
  };

  beforeEach(() => {
    warnCache.current = {};
    (global.console.warn as jest.Mock).mockClear();
  });

  test('resolves an exact match from a part type or a bare tool name', () => {
    expect(findTool('tool-foo', { foo })).toBe(foo);
    expect(findTool('foo', { foo })).toBe(foo);
  });

  test('only strips a leading `tool-`', () => {
    const tool = { name: 'my-tool-thing' };

    expect(findTool('tool-my-tool-thing', { 'my-tool-thing': tool })).toBe(
      tool
    );
  });

  test('resolves a derived name only for a tool that claims it', () => {
    expect(findTool('tool-foo_products', { foo: suffixedFoo })).toBe(
      suffixedFoo
    );
    expect(findTool('tool-foo_products', { foo })).toBeUndefined();
  });

  test('prefers an exact registration over a claim', () => {
    expect(
      findTool('tool-foo_bar', { foo: suffixedFoo, foo_bar: fooBar })
    ).toBe(fooBar);
    expect(
      findTool('tool-foo_bar', { foo_bar: fooBar, foo: suffixedFoo })
    ).toBe(fooBar);
  });

  test('registering overlapping names is unambiguous', () => {
    // Neither claims beyond its own name, so neither renders it.
    expect(
      findTool('tool-foo_bar_products', { foo, foo_bar: fooBar })
    ).toBeUndefined();
    expect(
      findTool('tool-foo_bar_products', { foo_bar: fooBar, foo })
    ).toBeUndefined();
  });

  test('resolves the most specific claim, whatever the registration order', () => {
    const suffixedFooBar = {
      name: 'foo_bar',
      matchesToolName: (toolName: string) => startsWith(toolName, 'foo_bar_'),
    };
    const tools = { foo: suffixedFoo, foo_bar: suffixedFooBar };

    expect(findTool('tool-foo_bar_products', tools)).toBe(suffixedFooBar);
    expect(
      findTool('tool-foo_bar_products', {
        foo_bar: suffixedFooBar,
        foo: suffixedFoo,
      })
    ).toBe(suffixedFooBar);
  });

  test('warns when several unrelated tools claim the same name', () => {
    const other = {
      name: 'other',
      matchesToolName: (toolName: string) => startsWith(toolName, 'foo_'),
    };

    // Settled deterministically, and warned about.
    expect(findTool('tool-foo_products', { foo: suffixedFoo, other })).toBe(
      other
    );
    expect(global.console.warn).toHaveBeenCalledWith(
      '[instantsearch-ui-components] Multiple tools claim "foo_products" through `matchesToolName`: "other", "foo". "other" handles it.'
    );
  });

  test('returns undefined when nothing matches', () => {
    expect(findTool('tool-other', { foo })).toBeUndefined();
    // A shared prefix is not a match without the `_` separator.
    expect(findTool('tool-foobar', { foo: suffixedFoo })).toBeUndefined();
  });

  test('points at `matchesToolName` when a registered name is a prefix', () => {
    expect(findTool('tool-foo_products', { foo })).toBeUndefined();
    expect(global.console.warn).toHaveBeenCalledWith(
      '[instantsearch-ui-components] No tool is registered for "foo_products". The registered tool "foo" is a prefix of it, but a prefix alone doesn\'t resolve: declare `matchesToolName` on the tool that should handle "foo_products".'
    );
  });

  test('lists every registered prefix of an unresolved name', () => {
    expect(
      findTool('tool-foo_bar_products', { foo_bar: fooBar, foo })
    ).toBeUndefined();
    expect(global.console.warn).toHaveBeenCalledWith(
      '[instantsearch-ui-components] No tool is registered for "foo_bar_products". The registered tools "foo", "foo_bar" are prefixes of it, but a prefix alone doesn\'t resolve: declare `matchesToolName` on the tool that should handle "foo_bar_products".'
    );
  });
});
