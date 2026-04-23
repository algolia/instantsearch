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

  test('emits provider, three structural widgets, and the experience config', () => {
    const files = generateExperience(baseManifest);

    expect(Array.from(files.keys()).sort()).toEqual(
      [
        'src/components/product-search/ClearRefinements.tsx',
        'src/components/product-search/Pagination.tsx',
        'src/components/product-search/SearchBox.tsx',
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
        refinementList: { attribute: 'brand' },
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
