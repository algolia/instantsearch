/**
 * Per-backend presentation: the client protocol is the same for both, only
 * the catalog differs. `VITE_AGENTIC_BACKEND=fake` uses the offline fake
 * served by the dev server; `inline` runs the same fake inside the page, for
 * builds that can't make network requests.
 */
const MODE = import.meta.env.VITE_AGENTIC_BACKEND;
export const BACKEND: 'fake' | 'agent-studio' =
  MODE === 'fake' || MODE === 'inline' ? 'fake' : 'agent-studio';
export const IN_BROWSER = MODE === 'inline';

/** Agent Studio mode only: the client talks to Algolia directly. */
export const ALGOLIA = {
  appId: 'latency',
  // Search-only key, as in the showcase. Agent completions need no more.
  searchApiKey: '6be0576ff61c053d5f9a3225e2a90f76',
  indexName: 'instant_search',
};

type Preset = {
  indexName: string;
  /** Sidebar facets, in order. */
  facets: string[];
  storeName: string;
  tag: string;
  suggestions: string[];
  followUps: string[];
};

const PRESETS: Record<typeof BACKEND, Preset> = {
  fake: {
    indexName: 'products',
    facets: ['category', 'color', 'material', 'brand'],
    storeName: 'Trailhead Supply',
    tag: 'Agentic search POC · fake backend',
    suggestions: [
      'blue shoes',
      'give me blue shoes',
      'running shoes under $120',
      'something for a rainy hike',
      'recommend flaky boots',
    ],
    followUps: [
      'in velours',
      'cheaper',
      'in black instead',
      'no leather',
      'boots',
    ],
  },
  'agent-studio': {
    indexName: ALGOLIA.indexName,
    facets: ['brand', 'categories', 'price_range'],
    storeName: 'Circuit Outlet',
    tag: 'Agentic search POC · Agent Studio',
    suggestions: [
      'laptop',
      'give me a laptop for my kid',
      'headphones under $100',
      'something to stream movies on my TV',
      'recommend a coffee maker',
    ],
    followUps: [
      'cheaper',
      'from Apple instead',
      'with free shipping',
      'for gaming',
    ],
  },
};

export const PRESET = PRESETS[BACKEND];

export const FACET_TITLES: Record<string, string> = {
  category: 'Category',
  categories: 'Category',
  color: 'Color',
  material: 'Material',
  brand: 'Brand',
  price_range: 'Price',
};
