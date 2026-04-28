jest.mock('algoliasearch', () => ({
  algoliasearch: jest.fn(),
}));

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { algoliasearch } from 'algoliasearch';

import { addExperience } from '../add-experience';
import { writeRootManifest, type RootManifest } from '../../manifest';
import { createScriptedPrompter } from '../../prompter';

const mockedAlgoliasearch = algoliasearch as unknown as jest.Mock;

function mockAlgolia({
  hits,
  getSettings,
}: {
  hits?: Array<Record<string, unknown>>;
  getSettings?: () => Promise<unknown>;
} = {}): void {
  mockedAlgoliasearch.mockImplementation(() => ({
    searchSingleIndex: () =>
      Promise.resolve({
        hits: hits ?? [
          {
            objectID: '1',
            name: 'Widget',
            image_url: 'https://example.com/w.jpg',
            description: 'A nice widget',
            _highlightResult: {
              name: { value: 'Widget' },
              description: { value: 'A nice widget' },
            },
          },
        ],
        facets: { brand: { Apple: 10 } },
      }),
    getSettings:
      getSettings ??
      (() => Promise.resolve({ replicas: ['products_price_asc'] })),
  }));
}

beforeEach(() => {
  mockedAlgoliasearch.mockReset();
  mockAlgolia();
});

function makeInitializedProject(overrides: Partial<RootManifest> = {}): string {
  const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'is-cli-add-exp-'));
  writeRootManifest(projectDir, {
    apiVersion: 1,
    flavor: 'react',
    framework: null,
    typescript: true,
    componentsPath: 'src/components',
    aliases: {},
    algolia: { appId: 'APP_ID_XYZ', searchApiKey: 'SEARCH_KEY_XYZ' },
    experiences: [],
    ...overrides,
  });
  return projectDir;
}

const SEARCH_SCHEMA = {
  hits: { title: 'name', image: 'image_url', description: 'description' },
  refinementList: [{ attribute: 'brand' }],
  sortBy: { replicas: ['products_price_asc'] },
};

describe('add experience command', () => {
  test('happy path: creates experience folder with provider + all six widgets + config', async () => {
    const projectDir = makeInitializedProject();

    const report = await addExperience({
      projectDir,
      name: 'product-search',
      template: 'search',
      indexName: 'products',
      schema: SEARCH_SCHEMA,
    });

    expect(report).toMatchObject({
      apiVersion: 1,
      ok: true,
      command: 'add experience',
      manifestUpdated: 'instantsearch.json',
    });

    const experienceDir = path.join(projectDir, 'src/components/product-search');
    expect(fs.existsSync(path.join(experienceDir, 'instantsearch.config.json'))).toBe(true);
    expect(fs.existsSync(path.join(experienceDir, 'provider.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(experienceDir, 'SearchBox.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(experienceDir, 'Pagination.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(experienceDir, 'ClearRefinements.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(experienceDir, 'Hits.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(experienceDir, 'RefinementListBrand.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(experienceDir, 'SortBy.tsx'))).toBe(true);
  });

  test('two successive add experience calls yield two independent experiences', async () => {
    const projectDir = makeInitializedProject();

    await addExperience({
      projectDir,
      name: 'product-search',
      template: 'search',
      indexName: 'products',
      schema: SEARCH_SCHEMA,
    });

    await addExperience({
      projectDir,
      name: 'docs-search',
      template: 'search',
      indexName: 'docs',
      schema: {
        hits: { title: 'page_title' },
        refinementList: [{ attribute: 'section' }],
        sortBy: { replicas: ['docs_updated_desc'] },
      },
    });

    const productProvider = fs.readFileSync(
      path.join(projectDir, 'src/components/product-search/provider.tsx'),
      'utf8'
    );
    const docsProvider = fs.readFileSync(
      path.join(projectDir, 'src/components/docs-search/provider.tsx'),
      'utf8'
    );
    expect(productProvider).toMatch(/indexName="products"/);
    expect(docsProvider).toMatch(/indexName="docs"/);
    expect(productProvider).toMatch(/ProductSearchProvider/);
    expect(docsProvider).toMatch(/DocsSearchProvider/);

    const root = JSON.parse(
      fs.readFileSync(path.join(projectDir, 'instantsearch.json'), 'utf8')
    );
    expect(root.experiences).toEqual([
      { name: 'product-search', path: 'src/components/product-search' },
      { name: 'docs-search', path: 'src/components/docs-search' },
    ]);
  });

  test('updates root manifest experiences array', async () => {
    const projectDir = makeInitializedProject();

    await addExperience({
      projectDir,
      name: 'product-search',
      template: 'search',
      indexName: 'products',
      schema: SEARCH_SCHEMA,
    });

    const root = JSON.parse(
      fs.readFileSync(path.join(projectDir, 'instantsearch.json'), 'utf8')
    );
    expect(root.experiences).toEqual([
      { name: 'product-search', path: 'src/components/product-search' },
    ]);
  });

  test('JSON payload includes filesCreated, manifestUpdated, and nextSteps', async () => {
    const projectDir = makeInitializedProject();

    const report = await addExperience({
      projectDir,
      name: 'product-search',
      template: 'search',
      indexName: 'products',
      schema: SEARCH_SCHEMA,
    });

    if (!report.ok) throw new Error('expected success');

    expect((report as any).filesCreated).toEqual(
      expect.arrayContaining([
        'src/components/product-search/instantsearch.config.json',
        'src/components/product-search/provider.tsx',
        'src/components/product-search/SearchBox.tsx',
        'src/components/product-search/Hits.tsx',
        'src/components/product-search/RefinementListBrand.tsx',
        'src/components/product-search/SortBy.tsx',
        'src/components/product-search/Pagination.tsx',
        'src/components/product-search/ClearRefinements.tsx',
        'src/components/product-search/index.tsx',
      ])
    );
    expect((report as any).experience).toEqual({
      name: 'product-search',
      path: 'src/components/product-search',
    });
    const nextSteps = (report as any).nextSteps;
    expect(Array.isArray(nextSteps.imports)).toBe(true);
    expect(nextSteps.imports.some((line: string) =>
      line.includes('ProductSearch')
    )).toBe(true);
    expect(typeof nextSteps.mountingGuidance).toBe('string');
    expect(nextSteps.mountingGuidance.length).toBeGreaterThan(0);
  });

  test('nextSteps.imports use a components alias when configured on the root manifest', async () => {
    const projectDir = makeInitializedProject({
      aliases: { components: '@/components' },
    });

    const report = await addExperience({
      projectDir,
      name: 'product-search',
      template: 'search',
      indexName: 'products',
      schema: SEARCH_SCHEMA,
    });

    if (!report.ok) throw new Error('expected success');
    const imports = (report as any).nextSteps.imports as string[];
    expect(imports).toContain(
      "import { ProductSearch } from '@/components/product-search';"
    );
  });

  test('nextSteps.imports fall back to componentsPath when no alias is configured', async () => {
    const projectDir = makeInitializedProject();

    const report = await addExperience({
      projectDir,
      name: 'product-search',
      template: 'search',
      indexName: 'products',
      schema: SEARCH_SCHEMA,
    });

    if (!report.ok) throw new Error('expected success');
    const imports = (report as any).nextSteps.imports as string[];
    expect(imports).toContain(
      "import { ProductSearch } from 'src/components/product-search';"
    );
  });

  test('fails with not_initialized when no root manifest exists', async () => {
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'is-cli-add-exp-'));

    const report = await addExperience({
      projectDir,
      name: 'product-search',
      template: 'search',
      indexName: 'products',
      schema: SEARCH_SCHEMA,
    });

    expect(report).toMatchObject({
      ok: false,
      command: 'add experience',
      code: 'not_initialized',
    });
    expect(fs.existsSync(path.join(projectDir, 'src/components'))).toBe(false);
  });

  test('fails with unknown_template for unsupported template', async () => {
    const projectDir = makeInitializedProject();

    const report = await addExperience({
      projectDir,
      name: 'product-search',
      template: 'autocomplete',
      indexName: 'products',
      schema: SEARCH_SCHEMA,
    });

    expect(report).toMatchObject({
      ok: false,
      command: 'add experience',
      code: 'unknown_template',
    });
  });

  describe('introspection failures', () => {
    function algoliaReject(status: number): void {
      const error = Object.assign(new Error(`Algolia ${status}`), { status });
      mockedAlgoliasearch.mockImplementation(() => ({
        searchSingleIndex: () => Promise.reject(error),
        getSettings: () => Promise.reject(error),
      }));
    }

    test('credentials_invalid bubbles up and no files are written', async () => {
      const projectDir = makeInitializedProject();
      algoliaReject(403);

      const report = await addExperience({
        projectDir,
        name: 'product-search',
        template: 'search',
        indexName: 'products',
        schema: SEARCH_SCHEMA,
      });

      expect(report).toMatchObject({
        ok: false,
        command: 'add experience',
        code: 'credentials_invalid',
      });
      expect(
        fs.existsSync(path.join(projectDir, 'src/components/product-search'))
      ).toBe(false);
      const root = JSON.parse(
        fs.readFileSync(path.join(projectDir, 'instantsearch.json'), 'utf8')
      );
      expect(root.experiences).toEqual([]);
    });

    test('index_not_found bubbles up and no files are written', async () => {
      const projectDir = makeInitializedProject();
      algoliaReject(404);

      const report = await addExperience({
        projectDir,
        name: 'product-search',
        template: 'search',
        indexName: 'missing',
        schema: SEARCH_SCHEMA,
      });

      expect(report).toMatchObject({
        ok: false,
        command: 'add experience',
        code: 'index_not_found',
      });
      expect(
        fs.existsSync(path.join(projectDir, 'src/components/product-search'))
      ).toBe(false);
    });

    test('index_empty bubbles up and no files are written', async () => {
      const projectDir = makeInitializedProject();
      mockAlgolia({ hits: [] });

      const report = await addExperience({
        projectDir,
        name: 'product-search',
        template: 'search',
        indexName: 'products',
        schema: SEARCH_SCHEMA,
      });

      expect(report).toMatchObject({
        ok: false,
        command: 'add experience',
        code: 'index_empty',
      });
      expect(
        fs.existsSync(path.join(projectDir, 'src/components/product-search'))
      ).toBe(false);
    });

    test('network_error bubbles up and no files are written', async () => {
      const projectDir = makeInitializedProject();
      mockedAlgoliasearch.mockImplementation(() => ({
        searchSingleIndex: () => Promise.reject(new Error('ECONNRESET')),
        getSettings: () => Promise.reject(new Error('ECONNRESET')),
      }));

      const report = await addExperience({
        projectDir,
        name: 'product-search',
        template: 'search',
        indexName: 'products',
        schema: SEARCH_SCHEMA,
      });

      expect(report).toMatchObject({
        ok: false,
        command: 'add experience',
        code: 'network_error',
      });
    });
  });

  describe('plain JS output (typescript: false)', () => {
    test('emits .jsx / .js files for provider + six widgets + config', async () => {
      const projectDir = makeInitializedProject({ typescript: false });

      const report = await addExperience({
        projectDir,
        name: 'product-search',
        template: 'search',
        indexName: 'products',
        schema: SEARCH_SCHEMA,
      });

      expect(report.ok).toBe(true);

      const experienceDir = path.join(
        projectDir,
        'src/components/product-search'
      );
      expect(
        fs.existsSync(path.join(experienceDir, 'instantsearch.config.json'))
      ).toBe(true);
      expect(fs.existsSync(path.join(experienceDir, 'provider.jsx'))).toBe(true);
      expect(fs.existsSync(path.join(experienceDir, 'SearchBox.jsx'))).toBe(true);
      expect(fs.existsSync(path.join(experienceDir, 'Pagination.jsx'))).toBe(true);
      expect(
        fs.existsSync(path.join(experienceDir, 'ClearRefinements.jsx'))
      ).toBe(true);
      expect(fs.existsSync(path.join(experienceDir, 'Hits.jsx'))).toBe(true);
      expect(
        fs.existsSync(path.join(experienceDir, 'RefinementListBrand.jsx'))
      ).toBe(true);
      expect(fs.existsSync(path.join(experienceDir, 'SortBy.jsx'))).toBe(true);

      expect(fs.existsSync(path.join(experienceDir, 'provider.tsx'))).toBe(false);
      expect(fs.existsSync(path.join(experienceDir, 'Hits.tsx'))).toBe(false);
    });

    test('provider.jsx has no TypeScript syntax', () => {
      const projectDir = makeInitializedProject({ typescript: false });

      return addExperience({
        projectDir,
        name: 'product-search',
        template: 'search',
        indexName: 'products',
        schema: SEARCH_SCHEMA,
      }).then(() => {
        const provider = fs.readFileSync(
          path.join(projectDir, 'src/components/product-search/provider.jsx'),
          'utf8'
        );
        expect(provider).not.toMatch(/import type/);
        expect(provider).not.toMatch(/ReactNode/);
      });
    });
  });

  describe('JS flavor output', () => {
    test('emits .js files for provider + six widget factories + config', async () => {
      const projectDir = makeInitializedProject({
        flavor: 'js',
        typescript: false,
      });

      const report = await addExperience({
        projectDir,
        name: 'product-search',
        template: 'search',
        indexName: 'products',
        schema: SEARCH_SCHEMA,
      });

      expect(report.ok).toBe(true);

      const experienceDir = path.join(
        projectDir,
        'src/components/product-search'
      );
      expect(
        fs.existsSync(path.join(experienceDir, 'instantsearch.config.json'))
      ).toBe(true);
      expect(fs.existsSync(path.join(experienceDir, 'provider.js'))).toBe(true);
      expect(fs.existsSync(path.join(experienceDir, 'SearchBox.js'))).toBe(true);
      expect(fs.existsSync(path.join(experienceDir, 'Pagination.js'))).toBe(true);
      expect(fs.existsSync(path.join(experienceDir, 'ClearRefinements.js'))).toBe(true);
      expect(fs.existsSync(path.join(experienceDir, 'Hits.js'))).toBe(true);
      expect(fs.existsSync(path.join(experienceDir, 'RefinementListBrand.js'))).toBe(true);
      expect(fs.existsSync(path.join(experienceDir, 'SortBy.js'))).toBe(true);

      // No React artefacts.
      expect(fs.existsSync(path.join(experienceDir, 'provider.jsx'))).toBe(false);
      expect(fs.existsSync(path.join(experienceDir, 'SearchBox.jsx'))).toBe(false);
    });

    test('provider.js imports instantsearch.js, not react-instantsearch', async () => {
      const projectDir = makeInitializedProject({
        flavor: 'js',
        typescript: false,
      });

      await addExperience({
        projectDir,
        name: 'product-search',
        template: 'search',
        indexName: 'products',
        schema: SEARCH_SCHEMA,
      });

      const provider = fs.readFileSync(
        path.join(projectDir, 'src/components/product-search/provider.js'),
        'utf8'
      );
      expect(provider).toMatch(/from ['"]instantsearch\.js['"]/);
      expect(provider).not.toMatch(/react-instantsearch/);
    });

    test('nextSteps imports point at the start helper + JS widget files', async () => {
      const projectDir = makeInitializedProject({
        flavor: 'js',
        typescript: false,
      });

      const report = await addExperience({
        projectDir,
        name: 'product-search',
        template: 'search',
        indexName: 'products',
        schema: SEARCH_SCHEMA,
      });

      if (!report.ok) throw new Error('expected success');
      const imports = (report as any).nextSteps.imports as string[];
      expect(imports).toContain(
        "import 'src/components/product-search';"
      );
      expect(imports.some((line) => line.includes('ProductSearchProvider'))).toBe(
        false
      );

      const guidance = (report as any).nextSteps.mountingGuidance as string;
      expect(guidance).toMatch(/container/i);
    });
  });

  describe('implicit widget skipping', () => {
    test('skips SortBy when --sort-by-replicas is not provided', async () => {
      const projectDir = makeInitializedProject();

      const report = await addExperience({
        projectDir,
        name: 'product-search',
        template: 'search',
        indexName: 'products',
        schema: {
          hits: { title: 'name' },
          refinementList: [{ attribute: 'brand' }],
        },
      });

      expect(report).toMatchObject({ ok: true, command: 'add experience' });

      const experienceDir = path.join(projectDir, 'src/components/product-search');
      expect(fs.existsSync(path.join(experienceDir, 'SortBy.tsx'))).toBe(false);
      expect(fs.existsSync(path.join(experienceDir, 'Hits.tsx'))).toBe(true);
      expect(fs.existsSync(path.join(experienceDir, 'RefinementListBrand.tsx'))).toBe(true);
    });

    test('skips RefinementList when --refinement-list-attribute is not provided', async () => {
      const projectDir = makeInitializedProject();

      const report = await addExperience({
        projectDir,
        name: 'product-search',
        template: 'search',
        indexName: 'products',
        schema: {
          hits: { title: 'name' },
          sortBy: { replicas: ['products_price_asc'] },
        },
      });

      expect(report).toMatchObject({ ok: true, command: 'add experience' });

      const experienceDir = path.join(projectDir, 'src/components/product-search');
      expect(fs.existsSync(path.join(experienceDir, 'RefinementListBrand.tsx'))).toBe(false);
      expect(fs.existsSync(path.join(experienceDir, 'RefinementList.tsx'))).toBe(false);
      expect(fs.existsSync(path.join(experienceDir, 'SortBy.tsx'))).toBe(true);
      expect(fs.existsSync(path.join(experienceDir, 'Hits.tsx'))).toBe(true);
    });

    test('skips both SortBy and RefinementList when neither flag is provided', async () => {
      const projectDir = makeInitializedProject();

      const report = await addExperience({
        projectDir,
        name: 'product-search',
        template: 'search',
        indexName: 'products',
        schema: { hits: { title: 'name' } },
      });

      expect(report).toMatchObject({ ok: true, command: 'add experience' });

      const experienceDir = path.join(projectDir, 'src/components/product-search');
      expect(fs.existsSync(path.join(experienceDir, 'SearchBox.tsx'))).toBe(true);
      expect(fs.existsSync(path.join(experienceDir, 'Hits.tsx'))).toBe(true);
      expect(fs.existsSync(path.join(experienceDir, 'Pagination.tsx'))).toBe(true);
      expect(fs.existsSync(path.join(experienceDir, 'ClearRefinements.tsx'))).toBe(true);
      expect(fs.existsSync(path.join(experienceDir, 'SortBy.tsx'))).toBe(false);
      expect(fs.existsSync(path.join(experienceDir, 'RefinementList.tsx'))).toBe(false);
    });

    test('still errors when --hits-title is missing (required schema)', async () => {
      const projectDir = makeInitializedProject();

      const report = await addExperience({
        projectDir,
        name: 'product-search',
        template: 'search',
        indexName: 'products',
        schema: {},
      });

      expect(report).toMatchObject({
        ok: false,
        code: 'missing_schema',
      });
      expect((report as any).message).toMatch(/hits-title/);
    });

    test('generates all template widgets when all schema flags are provided', async () => {
      const projectDir = makeInitializedProject();

      const report = await addExperience({
        projectDir,
        name: 'product-search',
        template: 'search',
        indexName: 'products',
        schema: SEARCH_SCHEMA,
      });

      expect(report).toMatchObject({ ok: true, command: 'add experience' });

      const experienceDir = path.join(projectDir, 'src/components/product-search');
      expect(fs.existsSync(path.join(experienceDir, 'SearchBox.tsx'))).toBe(true);
      expect(fs.existsSync(path.join(experienceDir, 'Hits.tsx'))).toBe(true);
      expect(fs.existsSync(path.join(experienceDir, 'Pagination.tsx'))).toBe(true);
      expect(fs.existsSync(path.join(experienceDir, 'SortBy.tsx'))).toBe(true);
      expect(fs.existsSync(path.join(experienceDir, 'RefinementListBrand.tsx'))).toBe(true);
      expect(fs.existsSync(path.join(experienceDir, 'ClearRefinements.tsx'))).toBe(true);
    });
  });

  describe('schema validation', () => {
    test('search template without schema fails with missing_schema and writes nothing', async () => {
      const projectDir = makeInitializedProject();

      const report = await addExperience({
        projectDir,
        name: 'product-search',
        template: 'search',
        indexName: 'products',
        // no schema
      });

      expect(report).toMatchObject({
        ok: false,
        command: 'add experience',
        code: 'missing_schema',
      });
      expect(
        fs.existsSync(path.join(projectDir, 'src/components/product-search'))
      ).toBe(false);
    });

    test('re-running add experience on an existing experience fails with file_conflict', async () => {
      const projectDir = makeInitializedProject();

      const first = await addExperience({
        projectDir,
        name: 'product-search',
        template: 'search',
        indexName: 'products',
        schema: SEARCH_SCHEMA,
      });
      expect(first.ok).toBe(true);

      const manifestBefore = fs.readFileSync(
        path.join(projectDir, 'instantsearch.json'),
        'utf8'
      );
      const searchBoxBefore = fs.readFileSync(
        path.join(projectDir, 'src/components/product-search/SearchBox.tsx'),
        'utf8'
      );

      const second = await addExperience({
        projectDir,
        name: 'product-search',
        template: 'search',
        indexName: 'products',
        schema: SEARCH_SCHEMA,
      });

      expect(second).toMatchObject({
        ok: false,
        command: 'add experience',
        code: 'file_conflict',
      });
      if (second.ok) throw new Error('expected failure');
      expect(second.message).toContain('add widget');

      // Root manifest unchanged (no duplicate experiences entry).
      expect(
        fs.readFileSync(path.join(projectDir, 'instantsearch.json'), 'utf8')
      ).toBe(manifestBefore);
      // Existing generated file is not overwritten.
      expect(
        fs.readFileSync(
          path.join(projectDir, 'src/components/product-search/SearchBox.tsx'),
          'utf8'
        )
      ).toBe(searchBoxBefore);
    });

    test('search template with partial schema (missing refinementList) succeeds by skipping RefinementList', async () => {
      const projectDir = makeInitializedProject();

      const report = await addExperience({
        projectDir,
        name: 'product-search',
        template: 'search',
        indexName: 'products',
        schema: {
          hits: { title: 'name' },
          sortBy: { replicas: ['products_price_asc'] },
        },
      });

      expect(report).toMatchObject({ ok: true, command: 'add experience' });

      const experienceDir = path.join(projectDir, 'src/components/product-search');
      expect(fs.existsSync(path.join(experienceDir, 'RefinementList.tsx'))).toBe(false);
      expect(fs.existsSync(path.join(experienceDir, 'SortBy.tsx'))).toBe(true);
    });
  });
});

describe('add experience command — interactive prompts', () => {
  beforeEach(() => {
    mockedAlgoliasearch.mockReset();
    mockAlgolia();
  });

  test('index_not_found: lists accessible indices and re-prompts for the index name', async () => {
    const projectDir = makeInitializedProject();
    let callCount = 0;
    mockedAlgoliasearch.mockImplementation(() => ({
      searchSingleIndex: () => {
        callCount++;
        if (callCount === 1) {
          // First call on 'wrong-index' → 404
          return Promise.reject(Object.assign(new Error('Not found'), { status: 404 }));
        }
        // Second call on 'products' → success
        return Promise.resolve({
          hits: [
            {
              objectID: '1',
              name: 'Widget',
              _highlightResult: { name: { value: 'Widget' } },
            },
          ],
          facets: { brand: { Apple: 10 } },
        });
      },
      listIndices: () =>
        Promise.resolve({ items: [{ name: 'products' }, { name: 'docs' }] }),
      getSettings: () => Promise.resolve({ replicas: ['products_price_asc'] }),
    }));

    const report = await addExperience({
      projectDir,
      name: 'product-search',
      template: 'search',
      schema: SEARCH_SCHEMA,
      prompter: createScriptedPrompter([
        'wrong-index', // first index attempt → index_not_found
        'products',    // re-prompted, picks from listed indices
      ]),
    });

    expect(report).toMatchObject({ ok: true, command: 'add experience' });
    const config = JSON.parse(
      fs.readFileSync(
        path.join(projectDir, 'src/components/product-search/instantsearch.config.json'),
        'utf8'
      )
    );
    expect(config.indexName).toBe('products');
  });

  test('prompts for index when not provided', async () => {
    const projectDir = makeInitializedProject();

    const report = await addExperience({
      projectDir,
      name: 'product-search',
      template: 'search',
      schema: SEARCH_SCHEMA,
      prompter: createScriptedPrompter([
        'products', // indexName
      ]),
    });

    expect(report).toMatchObject({ ok: true, command: 'add experience' });
    const config = JSON.parse(
      fs.readFileSync(
        path.join(projectDir, 'src/components/product-search/instantsearch.config.json'),
        'utf8'
      )
    );
    expect(config.indexName).toBe('products');
  });

  test('prompts for hits title, image, and refinementList attribute, sortBy replicas when schema not provided', async () => {
    const projectDir = makeInitializedProject();

    const report = await addExperience({
      projectDir,
      name: 'product-search',
      template: 'search',
      indexName: 'products',
      prompter: createScriptedPrompter([
        'name',          // hits title (selected from attributes)
        'image_url',     // hits image (selected from imageCandidates)
        // hits description is optional — not prompted
        ['brand'],       // refinementList attributes (multi-select from facets)
        ['products_price_asc'], // sortBy replicas (multi-select)
      ]),
    });

    expect(report).toMatchObject({ ok: true, command: 'add experience' });

    const hitsFile = fs.readFileSync(
      path.join(projectDir, 'src/components/product-search/Hits.tsx'),
      'utf8'
    );
    expect(hitsFile).toContain('name');
    expect(hitsFile).toContain('image_url');

    const rlFile = fs.readFileSync(
      path.join(projectDir, 'src/components/product-search/RefinementListBrand.tsx'),
      'utf8'
    );
    expect(rlFile).toContain('brand');
  });

  test('flags take precedence; prompts fill only missing schema fields', async () => {
    const projectDir = makeInitializedProject();

    const report = await addExperience({
      projectDir,
      name: 'product-search',
      template: 'search',
      indexName: 'products',
      schema: {
        hits: { title: 'name', image: 'image_url' },
        // refinementList and sortBy missing — should be prompted
      },
      prompter: createScriptedPrompter([
        ['brand'],                // refinementList attributes (multi-select)
        ['products_price_asc'],   // sortBy replicas
      ]),
    });

    expect(report).toMatchObject({ ok: true, command: 'add experience' });
  });

  test('no schema prompts when all schema fields are provided via flags', async () => {
    const projectDir = makeInitializedProject();

    // ScriptedPrompter with no answers — if any prompt fires it will throw.
    const report = await addExperience({
      projectDir,
      name: 'product-search',
      template: 'search',
      indexName: 'products',
      schema: SEARCH_SCHEMA,
      prompter: createScriptedPrompter([]),
    });

    expect(report).toMatchObject({ ok: true, command: 'add experience' });
  });

  test('index_empty: warns and prompts for manual schema entry', async () => {
    const projectDir = makeInitializedProject();
    mockedAlgoliasearch.mockImplementation(() => ({
      searchSingleIndex: () =>
        Promise.resolve({ hits: [], facets: { brand: { Apple: 10 } } }),
      getSettings: () =>
        Promise.resolve({ replicas: ['products_price_asc'] }),
    }));

    const report = await addExperience({
      projectDir,
      name: 'product-search',
      template: 'search',
      indexName: 'products',
      prompter: createScriptedPrompter([
        'title_field',    // manual hits title (free text)
        'img_field',      // manual hits image (free text)
        ['category'],     // refinementList attributes (multi-select from facets)
        ['price_asc'],    // sortBy replicas (multi-select)
      ]),
    });

    expect(report).toMatchObject({ ok: true, command: 'add experience' });

    const hitsFile = fs.readFileSync(
      path.join(projectDir, 'src/components/product-search/Hits.tsx'),
      'utf8'
    );
    expect(hitsFile).toContain('title_field');
  });

  test('index_has_no_facets: warns and prompts for RefinementList attribute manually', async () => {
    const projectDir = makeInitializedProject();
    mockedAlgoliasearch.mockImplementation(() => ({
      searchSingleIndex: (params: { searchParams?: { facets?: unknown } }) => {
        if (params?.searchParams?.facets) {
          // facets search returns no facets
          return Promise.resolve({ hits: [], facets: {} });
        }
        return Promise.resolve({
          hits: [
            {
              objectID: '1',
              name: 'Widget',
              _highlightResult: { name: { value: 'Widget' } },
            },
          ],
          facets: {},
        });
      },
      getSettings: () =>
        Promise.resolve({ replicas: ['products_price_asc'] }),
    }));

    const report = await addExperience({
      projectDir,
      name: 'product-search',
      template: 'search',
      indexName: 'products',
      schema: {
        hits: { title: 'name' },
        sortBy: { replicas: ['products_price_asc'] },
      },
      prompter: createScriptedPrompter([
        'manual_facet', // manual RefinementList attribute despite no configured facets
      ]),
    });

    expect(report).toMatchObject({ ok: true, command: 'add experience' });

    const rlFile = fs.readFileSync(
      path.join(projectDir, 'src/components/product-search/RefinementListManualFacet.tsx'),
      'utf8'
    );
    expect(rlFile).toContain('manual_facet');
  });

  test('settings_forbidden: falls back to manual replica entry', async () => {
    const projectDir = makeInitializedProject();
    mockedAlgoliasearch.mockImplementation(() => ({
      searchSingleIndex: () =>
        Promise.resolve({
          hits: [
            {
              objectID: '1',
              name: 'Widget',
              image_url: 'https://example.com/w.jpg',
              _highlightResult: { name: { value: 'Widget' } },
            },
          ],
          facets: { brand: { Apple: 10 } },
        }),
      getSettings: () =>
        Promise.reject(Object.assign(new Error('Forbidden'), { status: 403 })),
    }));

    const report = await addExperience({
      projectDir,
      name: 'product-search',
      template: 'search',
      indexName: 'products',
      schema: {
        hits: { title: 'name', image: 'image_url' },
        refinementList: [{ attribute: 'brand' }],
      },
      prompter: createScriptedPrompter([
        'products_price_asc,products_price_desc', // manual comma-separated replicas
      ]),
    });

    expect(report).toMatchObject({ ok: true, command: 'add experience' });

    const sortByFile = fs.readFileSync(
      path.join(projectDir, 'src/components/product-search/SortBy.tsx'),
      'utf8'
    );
    expect(sortByFile).toContain('products_price_asc');
    expect(sortByFile).toContain('products_price_desc');
  });

  test('no_replicas: offers to skip SortBy and generates without it', async () => {
    const projectDir = makeInitializedProject();
    mockedAlgoliasearch.mockImplementation(() => ({
      searchSingleIndex: () =>
        Promise.resolve({
          hits: [
            {
              objectID: '1',
              name: 'Widget',
              image_url: 'https://example.com/w.jpg',
              _highlightResult: { name: { value: 'Widget' } },
            },
          ],
          facets: { brand: { Apple: 10 } },
        }),
      getSettings: () => Promise.resolve({ replicas: [] }),
    }));

    const report = await addExperience({
      projectDir,
      name: 'product-search',
      template: 'search',
      indexName: 'products',
      schema: {
        hits: { title: 'name', image: 'image_url' },
        refinementList: [{ attribute: 'brand' }],
      },
      prompter: createScriptedPrompter([
        true, // confirm: skip SortBy
      ]),
    });

    expect(report).toMatchObject({ ok: true, command: 'add experience' });

    const experienceDir = path.join(projectDir, 'src/components/product-search');
    expect(fs.existsSync(path.join(experienceDir, 'SortBy.tsx'))).toBe(false);
    expect(fs.existsSync(path.join(experienceDir, 'SearchBox.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(experienceDir, 'Hits.tsx'))).toBe(true);
  });
});
