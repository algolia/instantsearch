import { generate, generateExperience } from '../index';

describe('generator', () => {
  test('React + TypeScript emits src/lib/algolia-client.ts with appId + searchApiKey inlined', () => {
    const files = generate({
      flavor: 'react',
      framework: null,
      typescript: true,
      algolia: { appId: 'APP_ID_XYZ', searchApiKey: 'SEARCH_KEY_XYZ' },
    });

    const contents = files.get('src/lib/algolia-client.ts');
    expect(contents).toBeDefined();
    expect(contents).toMatch(/from ['"]algoliasearch['"]/);
    expect(contents).toContain("'APP_ID_XYZ'");
    expect(contents).toContain("'SEARCH_KEY_XYZ'");
    expect(contents).toMatch(/export const searchClient/);
  });

  test('React + plain JS emits src/lib/algolia-client.js', () => {
    const files = generate({
      flavor: 'react',
      framework: null,
      typescript: false,
      algolia: { appId: 'APP_ID_XYZ', searchApiKey: 'SEARCH_KEY_XYZ' },
    });

    expect(files.has('src/lib/algolia-client.js')).toBe(true);
    expect(files.has('src/lib/algolia-client.ts')).toBe(false);
  });

  test('snapshot: React + TypeScript algolia-client.ts', () => {
    const files = generate({
      flavor: 'react',
      framework: null,
      typescript: true,
      algolia: { appId: 'APP_ID', searchApiKey: 'SEARCH_KEY' },
    });
    expect(files.get('src/lib/algolia-client.ts')).toMatchSnapshot();
  });

  test('snapshot: React + plain JS algolia-client.js', () => {
    const files = generate({
      flavor: 'react',
      framework: null,
      typescript: false,
      algolia: { appId: 'APP_ID', searchApiKey: 'SEARCH_KEY' },
    });
    expect(files.get('src/lib/algolia-client.js')).toMatchSnapshot();
  });
});

describe('generator: experience (React + TypeScript)', () => {
  const baseManifest = {
    flavor: 'react' as const,
    framework: null,
    typescript: true,
    componentsPath: 'src/components',
    aliases: {},
    algolia: { appId: 'APP_ID', searchApiKey: 'SEARCH_KEY' },
    experience: {
      name: 'product-search',
      indexName: 'products',
      widgets: ['SearchBox', 'Pagination', 'ClearRefinements'],
    },
  };

  test('emits provider, index, three structural widgets, and the experience config', () => {
    const files = generateExperience(baseManifest);

    expect(Array.from(files.keys()).sort()).toEqual(
      [
        'src/components/product-search/ClearRefinements.tsx',
        'src/components/product-search/Pagination.tsx',
        'src/components/product-search/SearchBox.tsx',
        'src/components/product-search/index.tsx',
        'src/components/product-search/instantsearch.config.json',
        'src/components/product-search/provider.tsx',
      ].sort()
    );
  });

  test('experience config encodes apiVersion, indexName, widgets', () => {
    const files = generateExperience(baseManifest);
    const config = JSON.parse(
      files.get('src/components/product-search/instantsearch.config.json')!
    );
    expect(config).toEqual({
      apiVersion: 1,
      indexName: 'products',
      widgets: ['SearchBox', 'Pagination', 'ClearRefinements'],
    });
  });

  test('provider exports ProductSearchProvider, imports InstantSearch + searchClient, uses indexName', () => {
    const files = generateExperience(baseManifest);
    const provider = files.get('src/components/product-search/provider.tsx')!;
    expect(provider).toMatch(/from ['"]react-instantsearch['"]/);
    expect(provider).toMatch(/InstantSearch/);
    expect(provider).toMatch(/searchClient/);
    expect(provider).toMatch(/indexName=['"]products['"]/);
    expect(provider).toMatch(/export function ProductSearchProvider/);
  });

  test('only emits widgets listed in the experience', () => {
    const files = generateExperience({
      ...baseManifest,
      experience: {
        ...baseManifest.experience,
        widgets: ['SearchBox'],
      },
    });

    expect(files.has('src/components/product-search/SearchBox.tsx')).toBe(true);
    expect(files.has('src/components/product-search/Pagination.tsx')).toBe(
      false
    );
    expect(
      files.has('src/components/product-search/ClearRefinements.tsx')
    ).toBe(false);
  });

  test('snapshot: provider.tsx', () => {
    const files = generateExperience(baseManifest);
    expect(
      files.get('src/components/product-search/provider.tsx')
    ).toMatchSnapshot();
  });

  test('snapshot: SearchBox.tsx', () => {
    const files = generateExperience(baseManifest);
    expect(
      files.get('src/components/product-search/SearchBox.tsx')
    ).toMatchSnapshot();
  });

  test('snapshot: Pagination.tsx', () => {
    const files = generateExperience(baseManifest);
    expect(
      files.get('src/components/product-search/Pagination.tsx')
    ).toMatchSnapshot();
  });

  test('snapshot: ClearRefinements.tsx', () => {
    const files = generateExperience(baseManifest);
    expect(
      files.get('src/components/product-search/ClearRefinements.tsx')
    ).toMatchSnapshot();
  });

  test('index.tsx exports ProductSearch, imports provider and all widgets', () => {
    const files = generateExperience(baseManifest);
    const index = files.get('src/components/product-search/index.tsx')!;
    expect(index).toMatch(/export function ProductSearch\(\)/);
    expect(index).toMatch(/import { ProductSearchProvider } from '\.\/provider'/);
    expect(index).toMatch(/import { SearchBox } from '\.\/SearchBox'/);
    expect(index).toMatch(/import { Pagination } from '\.\/Pagination'/);
    expect(index).toMatch(/import { ClearRefinements } from '\.\/ClearRefinements'/);
    expect(index).toMatch(/<ProductSearchProvider>/);
    expect(index).toMatch(/<SearchBox \/>/);
    expect(index).toMatch(/<Pagination \/>/);
    expect(index).toMatch(/<ClearRefinements \/>/);
  });

  test('index.tsx only includes widgets listed in the experience', () => {
    const files = generateExperience({
      ...baseManifest,
      experience: {
        ...baseManifest.experience,
        widgets: ['SearchBox'],
      },
    });
    const index = files.get('src/components/product-search/index.tsx')!;
    expect(index).toMatch(/<SearchBox \/>/);
    expect(index).not.toMatch(/Pagination/);
    expect(index).not.toMatch(/ClearRefinements/);
  });

  test('snapshot: index.tsx', () => {
    const files = generateExperience(baseManifest);
    expect(
      files.get('src/components/product-search/index.tsx')
    ).toMatchSnapshot();
  });
});

describe('generator: schema-driven widgets (React + TypeScript)', () => {
  const baseManifest = {
    flavor: 'react' as const,
    framework: null,
    typescript: true,
    componentsPath: 'src/components',
    aliases: {},
    algolia: { appId: 'APP_ID', searchApiKey: 'SEARCH_KEY' },
    experience: {
      name: 'product-search',
      indexName: 'products',
      widgets: ['Hits', 'RefinementList', 'SortBy'],
      schema: {
        hits: { title: 'name', image: 'image_url', description: 'description' },
        refinementList: [{ attribute: 'brand' }],
        sortBy: {
          replicas: ['products_price_asc', 'products_price_desc'],
        },
      },
    },
  };

  test('Hits.tsx renders a typed ProductHit with the schema-mapped attributes', () => {
    const files = generateExperience(baseManifest);
    const hits = files.get('src/components/product-search/Hits.tsx')!;
    expect(hits).toMatch(/from ['"]react-instantsearch['"]/);
    expect(hits).toMatch(/hit\.name/);
    expect(hits).toMatch(/hit\.image_url/);
    expect(hits).toMatch(/hit\.description/);
    expect(hits).toMatch(/export function Hits/);
  });

  test('Hits.tsx omits the image element when no image attribute is configured', () => {
    const files = generateExperience({
      ...baseManifest,
      experience: {
        ...baseManifest.experience,
        schema: {
          ...baseManifest.experience.schema,
          hits: { title: 'name' },
        },
      },
    });
    const hits = files.get('src/components/product-search/Hits.tsx')!;
    expect(hits).toMatch(/hit\.name/);
    expect(hits).not.toMatch(/<img/);
    expect(hits).not.toMatch(/image_url/);
  });

  test('RefinementList.tsx bakes in the facet attribute', () => {
    const files = generateExperience(baseManifest);
    const refinement = files.get(
      'src/components/product-search/RefinementList.tsx'
    )!;
    expect(refinement).toMatch(/attribute=['"]brand['"]/);
  });

  test('SortBy.tsx lists the index + replicas as sort items', () => {
    const files = generateExperience(baseManifest);
    const sortBy = files.get('src/components/product-search/SortBy.tsx')!;
    // Primary index should be first in the items array.
    expect(sortBy).toMatch(/value:\s*['"]products['"]/);
    expect(sortBy).toMatch(/value:\s*['"]products_price_asc['"]/);
    expect(sortBy).toMatch(/value:\s*['"]products_price_desc['"]/);
  });

  test('snapshot: Hits.tsx', () => {
    const files = generateExperience(baseManifest);
    expect(
      files.get('src/components/product-search/Hits.tsx')
    ).toMatchSnapshot();
  });

  test('snapshot: Hits.tsx without image', () => {
    const files = generateExperience({
      ...baseManifest,
      experience: {
        ...baseManifest.experience,
        schema: {
          ...baseManifest.experience.schema,
          hits: { title: 'name', description: 'description' },
        },
      },
    });
    expect(
      files.get('src/components/product-search/Hits.tsx')
    ).toMatchSnapshot();
  });

  test('snapshot: RefinementList.tsx', () => {
    const files = generateExperience(baseManifest);
    expect(
      files.get('src/components/product-search/RefinementList.tsx')
    ).toMatchSnapshot();
  });

  test('snapshot: SortBy.tsx', () => {
    const files = generateExperience(baseManifest);
    expect(
      files.get('src/components/product-search/SortBy.tsx')
    ).toMatchSnapshot();
  });
});

describe('generator: multiple RefinementLists (React + TypeScript)', () => {
  const baseManifest = {
    flavor: 'react' as const,
    framework: null,
    typescript: true,
    componentsPath: 'src/components',
    aliases: {},
    algolia: { appId: 'APP_ID', searchApiKey: 'SEARCH_KEY' },
    experience: {
      name: 'product-search',
      indexName: 'products',
      widgets: ['SearchBox', 'RefinementListBrand', 'RefinementListCategory', 'Pagination'],
      schema: {
        refinementList: [
          { attribute: 'brand' },
          { attribute: 'category' },
        ],
      },
    },
  };

  test('generates one file per RefinementList attribute with the correct content', () => {
    const files = generateExperience(baseManifest);

    const brandFile = files.get('src/components/product-search/RefinementListBrand.tsx')!;
    expect(brandFile).toBeDefined();
    expect(brandFile).toMatch(/attribute=['"]brand['"]/);
    expect(brandFile).toMatch(/export function RefinementListBrand/);

    const categoryFile = files.get('src/components/product-search/RefinementListCategory.tsx')!;
    expect(categoryFile).toBeDefined();
    expect(categoryFile).toMatch(/attribute=['"]category['"]/);
    expect(categoryFile).toMatch(/export function RefinementListCategory/);
  });

  test('index.tsx imports and renders all RefinementList instances', () => {
    const files = generateExperience(baseManifest);
    const index = files.get('src/components/product-search/index.tsx')!;

    expect(index).toMatch(/import { RefinementListBrand } from '\.\/RefinementListBrand'/);
    expect(index).toMatch(/import { RefinementListCategory } from '\.\/RefinementListCategory'/);
    expect(index).toMatch(/<RefinementListBrand \/>/);
    expect(index).toMatch(/<RefinementListCategory \/>/);
  });
});

describe('generator: experience (React + plain JS)', () => {
  const baseManifest = {
    flavor: 'react' as const,
    framework: null,
    typescript: false,
    componentsPath: 'src/components',
    aliases: {},
    algolia: { appId: 'APP_ID', searchApiKey: 'SEARCH_KEY' },
    experience: {
      name: 'product-search',
      indexName: 'products',
      widgets: ['SearchBox', 'Pagination', 'ClearRefinements'],
    },
  };

  test('provider.jsx does not import the ReactNode type', () => {
    const files = generateExperience(baseManifest);
    const provider = files.get('src/components/product-search/provider.jsx')!;
    expect(provider).toBeDefined();
    expect(provider).not.toMatch(/import type/);
    expect(provider).not.toMatch(/ReactNode/);
  });

  test('emits structural widgets at .jsx paths, not .tsx', () => {
    const files = generateExperience(baseManifest);
    expect(Array.from(files.keys()).sort()).toEqual(
      [
        'src/components/product-search/ClearRefinements.jsx',
        'src/components/product-search/Pagination.jsx',
        'src/components/product-search/SearchBox.jsx',
        'src/components/product-search/index.jsx',
        'src/components/product-search/instantsearch.config.json',
        'src/components/product-search/provider.jsx',
      ].sort()
    );
  });

  test('snapshot: provider.jsx', () => {
    const files = generateExperience(baseManifest);
    expect(
      files.get('src/components/product-search/provider.jsx')
    ).toMatchSnapshot();
  });

  test('snapshot: SearchBox.jsx', () => {
    const files = generateExperience(baseManifest);
    expect(
      files.get('src/components/product-search/SearchBox.jsx')
    ).toMatchSnapshot();
  });

  test('snapshot: Pagination.jsx', () => {
    const files = generateExperience(baseManifest);
    expect(
      files.get('src/components/product-search/Pagination.jsx')
    ).toMatchSnapshot();
  });

  test('snapshot: ClearRefinements.jsx', () => {
    const files = generateExperience(baseManifest);
    expect(
      files.get('src/components/product-search/ClearRefinements.jsx')
    ).toMatchSnapshot();
  });

  test('snapshot: index.jsx', () => {
    const files = generateExperience(baseManifest);
    expect(
      files.get('src/components/product-search/index.jsx')
    ).toMatchSnapshot();
  });
});

describe('generator: experience (React + Next.js App Router + TypeScript)', () => {
  const baseManifest = {
    flavor: 'react' as const,
    framework: 'nextjs' as const,
    typescript: true,
    componentsPath: 'src/components',
    aliases: {},
    algolia: { appId: 'APP_ID', searchApiKey: 'SEARCH_KEY' },
    experience: {
      name: 'product-search',
      indexName: 'products',
      widgets: ['SearchBox', 'Pagination', 'ClearRefinements'],
    },
  };

  test('provider.tsx is a client component importing InstantSearchNext from react-instantsearch-nextjs', () => {
    const files = generateExperience(baseManifest);
    const provider = files.get('src/components/product-search/provider.tsx')!;
    expect(provider).toBeDefined();
    expect(provider.startsWith("'use client';")).toBe(true);
    expect(provider).toMatch(/from ['"]react-instantsearch-nextjs['"]/);
    expect(provider).toMatch(/InstantSearchNext/);
    expect(provider).not.toMatch(/from ['"]react-instantsearch['"]/);
    expect(provider).toMatch(/indexName=['"]products['"]/);
    expect(provider).toMatch(/export function ProductSearchProvider/);
  });

  test('widget files are identical to the React-plain path', () => {
    const nextFiles = generateExperience(baseManifest);
    const reactFiles = generateExperience({
      ...baseManifest,
      framework: null,
    });
    for (const widget of baseManifest.experience.widgets) {
      const key = `src/components/product-search/${widget}.tsx`;
      expect(nextFiles.get(key)).toBe(reactFiles.get(key));
    }
  });

  test('snapshot: provider.tsx (Next.js App Router)', () => {
    const files = generateExperience(baseManifest);
    expect(
      files.get('src/components/product-search/provider.tsx')
    ).toMatchSnapshot();
  });

  test('index.tsx is a client component for Next.js App Router', () => {
    const files = generateExperience(baseManifest);
    const index = files.get('src/components/product-search/index.tsx')!;
    expect(index.startsWith("'use client';")).toBe(true);
  });

  test('index.tsx omits use client for non-Next.js React', () => {
    const files = generateExperience({ ...baseManifest, framework: null });
    const index = files.get('src/components/product-search/index.tsx')!;
    expect(index).not.toMatch(/use client/);
  });
});

describe('generator: experience (JS flavor)', () => {
  const baseManifest = {
    flavor: 'js' as const,
    framework: null,
    typescript: false,
    componentsPath: 'src/components',
    aliases: {},
    algolia: { appId: 'APP_ID', searchApiKey: 'SEARCH_KEY' },
    experience: {
      name: 'product-search',
      indexName: 'products',
      widgets: ['SearchBox', 'Pagination', 'ClearRefinements'],
    },
  };

  test('emits .js files for provider and structural widgets', () => {
    const files = generateExperience(baseManifest);
    expect(Array.from(files.keys()).sort()).toEqual(
      [
        'src/components/product-search/ClearRefinements.js',
        'src/components/product-search/Pagination.js',
        'src/components/product-search/SearchBox.js',
        'src/components/product-search/index.js',
        'src/components/product-search/instantsearch.config.json',
        'src/components/product-search/provider.js',
      ].sort()
    );
  });

  test('provider.js holds the instantsearch() instance with addWidgets + start orchestration', () => {
    const files = generateExperience(baseManifest);
    const provider = files.get('src/components/product-search/provider.js')!;

    expect(provider).toMatch(/from ['"]instantsearch\.js['"]/);
    expect(provider).toMatch(/searchClient/);
    expect(provider).toMatch(/indexName:\s*['"]products['"]/);
    expect(provider).toMatch(/export function startProductSearch/);
    expect(provider).toMatch(/\.addWidgets\(/);
    expect(provider).toMatch(/\.start\(\)/);
    // No React bits.
    expect(provider).not.toMatch(/react-instantsearch/);
    expect(provider).not.toMatch(/ReactNode/);
  });

  test('widget factories take a container and return the configured widget', () => {
    const files = generateExperience(baseManifest);

    const searchBox = files.get('src/components/product-search/SearchBox.js')!;
    expect(searchBox).toMatch(/from ['"]instantsearch\.js\/es\/widgets['"]/);
    expect(searchBox).toMatch(/export function SearchBox\(container\)/);
    expect(searchBox).toMatch(/return searchBox\({ container }\)/);

    const pagination = files.get('src/components/product-search/Pagination.js')!;
    expect(pagination).toMatch(/export function Pagination\(container\)/);
    expect(pagination).toMatch(/return pagination\({ container }\)/);

    const clear = files.get(
      'src/components/product-search/ClearRefinements.js'
    )!;
    expect(clear).toMatch(/export function ClearRefinements\(container\)/);
    expect(clear).toMatch(/return clearRefinements\({ container }\)/);
  });

  test('widget files contain no JSX or TS syntax', () => {
    const files = generateExperience(baseManifest);
    for (const widget of baseManifest.experience.widgets) {
      const content = files.get(`src/components/product-search/${widget}.js`)!;
      expect(content).not.toMatch(/<\/?[A-Z]/);
      expect(content).not.toMatch(/: string/);
      expect(content).not.toMatch(/type /);
    }
  });

  test('snapshot: provider.js', () => {
    const files = generateExperience(baseManifest);
    expect(
      files.get('src/components/product-search/provider.js')
    ).toMatchSnapshot();
  });

  test('snapshot: SearchBox.js', () => {
    const files = generateExperience(baseManifest);
    expect(
      files.get('src/components/product-search/SearchBox.js')
    ).toMatchSnapshot();
  });

  test('snapshot: Pagination.js', () => {
    const files = generateExperience(baseManifest);
    expect(
      files.get('src/components/product-search/Pagination.js')
    ).toMatchSnapshot();
  });

  test('snapshot: ClearRefinements.js', () => {
    const files = generateExperience(baseManifest);
    expect(
      files.get('src/components/product-search/ClearRefinements.js')
    ).toMatchSnapshot();
  });

  test('index.js calls startProductSearch with all widgets and prefilled container IDs', () => {
    const files = generateExperience(baseManifest);
    const index = files.get('src/components/product-search/index.js')!;
    expect(index).toMatch(/import { startProductSearch } from '\.\/provider'/);
    expect(index).toMatch(/import { SearchBox } from '\.\/SearchBox'/);
    expect(index).toMatch(/import { Pagination } from '\.\/Pagination'/);
    expect(index).toMatch(/import { ClearRefinements } from '\.\/ClearRefinements'/);
    expect(index).toMatch(/startProductSearch\(\[/);
    expect(index).toMatch(/SearchBox\('#search-box'\)/);
    expect(index).toMatch(/Pagination\('#pagination'\)/);
    expect(index).toMatch(/ClearRefinements\('#clear-refinements'\)/);
  });

  test('index.js contains no JSX or TS syntax', () => {
    const files = generateExperience(baseManifest);
    const index = files.get('src/components/product-search/index.js')!;
    expect(index).not.toMatch(/<\/?[A-Z]/);
    expect(index).not.toMatch(/: string/);
    expect(index).not.toMatch(/type /);
  });

  test('snapshot: index.js', () => {
    const files = generateExperience(baseManifest);
    expect(
      files.get('src/components/product-search/index.js')
    ).toMatchSnapshot();
  });
});

describe('generator: schema-driven widgets (JS flavor)', () => {
  const baseManifest = {
    flavor: 'js' as const,
    framework: null,
    typescript: false,
    componentsPath: 'src/components',
    aliases: {},
    algolia: { appId: 'APP_ID', searchApiKey: 'SEARCH_KEY' },
    experience: {
      name: 'product-search',
      indexName: 'products',
      widgets: ['Hits', 'RefinementList', 'SortBy'],
      schema: {
        hits: { title: 'name', image: 'image_url', description: 'description' },
        refinementList: [{ attribute: 'brand' }],
        sortBy: {
          replicas: ['products_price_asc', 'products_price_desc'],
        },
      },
    },
  };

  test('Hits.js templates against the schema-mapped attributes', () => {
    const files = generateExperience(baseManifest);
    const hits = files.get('src/components/product-search/Hits.js')!;
    expect(hits).toMatch(/from ['"]instantsearch\.js\/es\/widgets['"]/);
    expect(hits).toMatch(/export function Hits\(container\)/);
    expect(hits).toMatch(/return hits\(/);
    expect(hits).toMatch(/hit\.name/);
    expect(hits).toMatch(/hit\.image_url/);
    expect(hits).toMatch(/hit\.description/);
    // No React imports or JSX expressions.
    expect(hits).not.toMatch(/from ['"]react-instantsearch['"]/);
    expect(hits).not.toMatch(/InstantSearchHits/);
  });

  test('Hits.js omits the image expression when no image attribute is configured', () => {
    const files = generateExperience({
      ...baseManifest,
      experience: {
        ...baseManifest.experience,
        schema: {
          ...baseManifest.experience.schema,
          hits: { title: 'name' },
        },
      },
    });
    const hits = files.get('src/components/product-search/Hits.js')!;
    expect(hits).toMatch(/hit\.name/);
    expect(hits).not.toMatch(/image_url/);
  });

  test('RefinementList.js bakes in the facet attribute', () => {
    const files = generateExperience(baseManifest);
    const refinement = files.get(
      'src/components/product-search/RefinementList.js'
    )!;
    expect(refinement).toMatch(/export function RefinementList\(container\)/);
    expect(refinement).toMatch(/attribute:\s*['"]brand['"]/);
  });

  test('SortBy.js lists the index + replicas as sort items', () => {
    const files = generateExperience(baseManifest);
    const sortBy = files.get('src/components/product-search/SortBy.js')!;
    expect(sortBy).toMatch(/export function SortBy\(container\)/);
    expect(sortBy).toMatch(/value:\s*['"]products['"]/);
    expect(sortBy).toMatch(/value:\s*['"]products_price_asc['"]/);
    expect(sortBy).toMatch(/value:\s*['"]products_price_desc['"]/);
  });

  test('snapshot: Hits.js', () => {
    const files = generateExperience(baseManifest);
    expect(files.get('src/components/product-search/Hits.js')).toMatchSnapshot();
  });

  test('snapshot: Hits.js without image', () => {
    const files = generateExperience({
      ...baseManifest,
      experience: {
        ...baseManifest.experience,
        schema: {
          ...baseManifest.experience.schema,
          hits: { title: 'name', description: 'description' },
        },
      },
    });
    expect(files.get('src/components/product-search/Hits.js')).toMatchSnapshot();
  });

  test('snapshot: RefinementList.js', () => {
    const files = generateExperience(baseManifest);
    expect(
      files.get('src/components/product-search/RefinementList.js')
    ).toMatchSnapshot();
  });

  test('snapshot: SortBy.js', () => {
    const files = generateExperience(baseManifest);
    expect(
      files.get('src/components/product-search/SortBy.js')
    ).toMatchSnapshot();
  });
});

describe('generator: schema-driven widgets (React + plain JS)', () => {
  const baseManifest = {
    flavor: 'react' as const,
    framework: null,
    typescript: false,
    componentsPath: 'src/components',
    aliases: {},
    algolia: { appId: 'APP_ID', searchApiKey: 'SEARCH_KEY' },
    experience: {
      name: 'product-search',
      indexName: 'products',
      widgets: ['Hits', 'RefinementList', 'SortBy'],
      schema: {
        hits: { title: 'name', image: 'image_url', description: 'description' },
        refinementList: [{ attribute: 'brand' }],
        sortBy: {
          replicas: ['products_price_asc', 'products_price_desc'],
        },
      },
    },
  };

  test('Hits.jsx contains no TypeScript type syntax', () => {
    const files = generateExperience(baseManifest);
    const hits = files.get('src/components/product-search/Hits.jsx')!;
    expect(hits).toBeDefined();
    expect(hits).not.toMatch(/type HitRecord/);
    expect(hits).not.toMatch(/InstantSearchHits</);
    expect(hits).not.toMatch(/:\s*\{\s*hit:/);
    expect(hits).toMatch(/hit\.name/);
    expect(hits).toMatch(/hit\.image_url/);
    expect(hits).toMatch(/hit\.description/);
  });

  test('snapshot: Hits.jsx', () => {
    const files = generateExperience(baseManifest);
    expect(
      files.get('src/components/product-search/Hits.jsx')
    ).toMatchSnapshot();
  });

  test('snapshot: Hits.jsx without image', () => {
    const files = generateExperience({
      ...baseManifest,
      experience: {
        ...baseManifest.experience,
        schema: {
          ...baseManifest.experience.schema,
          hits: { title: 'name', description: 'description' },
        },
      },
    });
    expect(
      files.get('src/components/product-search/Hits.jsx')
    ).toMatchSnapshot();
  });

  test('snapshot: RefinementList.jsx', () => {
    const files = generateExperience(baseManifest);
    expect(
      files.get('src/components/product-search/RefinementList.jsx')
    ).toMatchSnapshot();
  });

  test('snapshot: SortBy.jsx', () => {
    const files = generateExperience(baseManifest);
    expect(
      files.get('src/components/product-search/SortBy.jsx')
    ).toMatchSnapshot();
  });
});
