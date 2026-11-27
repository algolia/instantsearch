import fs from 'fs';
import os from 'os';
import path from 'path';

import {
  imageAttributeCandidates,
  orderDisplayAttributes,
  runIntrospect,
  type SearchFn,
  type SearchResponse,
} from '../introspect';

// Shape of a query on Algolia's public demo index (latency / instant_search).
const demoResponse: SearchResponse = {
  nbHits: 21468,
  hits: [
    {
      objectID: '5477500',
      name: 'Amazon - Fire TV Stick',
      description: 'Streaming media player',
      brand: 'Amazon',
      price: 39.99,
      image: 'https://cdn-demo.algolia.com/bestbuy-0118/5477500_sb.jpg',
      url: 'https://api.bestbuy.com/click/-/5477500/pdp',
      free_shipping: false,
      _geoloc: { lat: 40.7, lng: -73.9 },
      _highlightResult: {
        name: {},
        description: {},
        brand: {},
        categories: {},
      },
    },
  ],
  facets: {
    brand: Object.fromEntries(
      Array.from({ length: 100 }, (_, i) => [`Brand ${i}`, 1])
    ),
    categories: { Laptops: 3, Phones: 2 },
    'hierarchicalCategories.lvl0': { 'TV & Home Theater': 4 },
    'hierarchicalCategories.lvl1': { 'TV & Home Theater > TVs': 2 },
    free_shipping: { true: 5, false: 3 },
    price: { '39.99': 1 },
    popularity: { '21469': 1 },
    rating: { '4': 2 },
  },
  facets_stats: {
    price: { min: 1, max: 5000 },
    popularity: { min: 1, max: 21469 },
    rating: { min: 0, max: 5 },
  },
  renderingContent: {
    facetOrdering: {
      facets: {
        order: ['brand', 'hierarchicalCategories.lvl0', 'categories', 'price'],
      },
    },
  },
};

function captureIO() {
  const stdout: string[] = [];
  const stderr: string[] = [];
  return {
    stdout,
    stderr,
    io: {
      stdout: (c: string) => stdout.push(c),
      stderr: (c: string) => stderr.push(c),
    },
  };
}

function tempProject(files: Record<string, string> = {}): string {
  const dir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'instantsearch-introspect-')
  );
  for (const [name, contents] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), contents, 'utf8');
  }
  return dir;
}

function fakeSearch(
  responses: Record<string, SearchResponse | { status: number }>
): SearchFn & { calls: Array<{ appId: string; indexName: string }> } {
  const calls: Array<{ appId: string; indexName: string }> = [];
  const search = (async ({ appId }, { indexName }) => {
    calls.push({ appId, indexName });
    const reply = responses[indexName];
    if (!reply)
      throw Object.assign(new Error('Index does not exist'), { status: 404 });
    if ('status' in reply)
      throw Object.assign(new Error(`HTTP ${reply.status}`), {
        status: reply.status,
      });
    return reply;
  }) as SearchFn & { calls: typeof calls };
  search.calls = calls;
  return search;
}

async function introspect(
  options: Partial<Parameters<typeof runIntrospect>[0]>
) {
  const capture = captureIO();
  const exitCode = await runIntrospect(
    { cwd: tempProject(), json: true, env: {}, ...options },
    capture.io
  );
  return { exitCode, envelope: JSON.parse(capture.stdout.join('')) };
}

describe('introspect', () => {
  it('builds a widget plan from the index structure', async () => {
    const { exitCode, envelope } = await introspect({
      index: 'instant_search',
      appId: 'latency',
      searchApiKey: 'search-key',
      search: fakeSearch({
        instant_search: demoResponse,
        instant_search_demo_query_suggestions: {
          nbHits: 1588,
          hits: [{ query: 'macbooks' }],
        },
      }),
    });

    expect(exitCode).toBe(0);
    const { data } = envelope;
    expect(data).toMatchObject({
      indexName: 'instant_search',
      nbHits: 21468,
      credentialsSource: 'flags',
      displayAttributes: ['name', 'description', 'brand', 'categories'],
      imageAttributes: ['image', 'url'],
      numericFacets: ['price', 'popularity', 'rating'],
      querySuggestionsIndex: 'instant_search_demo_query_suggestions',
    });

    const widgets = data.widgetPlan.map(
      (s: { widget: string; attribute?: string; attributes?: string[] }) =>
        [s.widget, s.attribute ?? s.attributes?.join('+') ?? ''].join(':')
    );
    expect(widgets).toEqual([
      'Autocomplete:',
      'DynamicWidgets:',
      'RefinementList:brand',
      'HierarchicalMenu:hierarchicalCategories.lvl0+hierarchicalCategories.lvl1',
      'RefinementList:categories',
      'RangeInput:price',
      'ToggleRefinement:free_shipping',
      'RangeInput:rating',
      'CurrentRefinements:',
      'GeoSearch:',
      'Hits:name+image+price',
      'Pagination:',
      'insights:',
    ]);
    expect(
      data.widgetPlan.find(
        (s: { attribute?: string }) => s.attribute === 'brand'
      ).searchable
    ).toBe(true);
    expect(data.createInstantSearchAppCommand).toBe(
      'npx create-instantsearch-app search-app --template "React InstantSearch" --app-id latency --api-key search-key --index-name instant_search --attributes-to-display name,description,brand --image-attribute image --attributes-for-faceting brand,categories --enable-insights --no-interactive'
    );
  });

  it('reads credentials and the index name from .env.local', async () => {
    const search = fakeSearch({ products: { nbHits: 0, hits: [] } });
    const { exitCode, envelope } = await introspect({
      cwd: tempProject({
        '.env.local':
          'ALGOLIA_APP_ID=env-app\nALGOLIA_SEARCH_API_KEY=env-key\nALGOLIA_INDEX_NAME=products\n',
      }),
      search,
    });

    expect(exitCode).toBe(0);
    expect(envelope.data.credentialsSource).toBe(
      'ALGOLIA_APP_ID and ALGOLIA_SEARCH_API_KEY (.env.local)'
    );
    expect(search.calls[0]).toEqual({
      appId: 'env-app',
      indexName: 'products',
    });
  });

  it.each([
    [404, 'index_not_found'],
    [403, 'credentials_invalid'],
    [500, 'algolia_error'],
  ])('classifies HTTP %s as %s', async (status, code) => {
    const { exitCode, envelope } = await introspect({
      index: 'products',
      appId: 'a',
      searchApiKey: 'k',
      search: fakeSearch({ products: { status } }),
    });
    expect(exitCode).toBe(1);
    expect(envelope).toMatchObject({ ok: false, command: 'introspect', code });
  });

  it('explains where credentials can come from when none are found', async () => {
    const { exitCode, envelope } = await introspect({ index: 'products' });
    expect(exitCode).toBe(1);
    expect(envelope).toMatchObject({ code: 'missing_credentials' });
    expect(envelope.message).toContain('ALGOLIA_APP_ID');
  });

  it('refuses half-specified flags', async () => {
    const { envelope } = await introspect({ index: 'products', appId: 'a' });
    expect(envelope).toMatchObject({ code: 'missing_required_flag' });
    expect(envelope.message).toContain('--search-api-key');
  });

  it('requires an index name', async () => {
    const { envelope } = await introspect({ appId: 'a', searchApiKey: 'k' });
    expect(envelope).toMatchObject({ code: 'missing_required_flag' });
    expect(envelope.message).toContain('ALGOLIA_INDEX_NAME');
  });
});

describe('heuristics ported from Create InstantSearch App', () => {
  it('puts title, name, and description first', () => {
    expect(orderDisplayAttributes(['brand', 'description', 'name'])).toEqual([
      'name',
      'description',
      'brand',
    ]);
  });

  it('ranks image-like string fields and skips text, ids, and numbers', () => {
    expect(
      imageAttributeCandidates([
        {
          objectID: 'abc',
          thumbnail_url: 'https://cdn/x.png',
          sku: 'ABC-123',
          title: 'A product',
          price: 10,
          _highlightResult: { title: {} },
        },
      ])
    ).toEqual(['thumbnail_url']);
  });
});
