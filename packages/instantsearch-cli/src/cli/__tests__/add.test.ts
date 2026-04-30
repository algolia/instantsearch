jest.mock('algoliasearch', () => ({
  algoliasearch: jest.fn(),
}));

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { algoliasearch } from 'algoliasearch';

import { add } from '../add';
import { writeRootManifest, type RootManifest } from '../../manifest';

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

const SEARCH_SCHEMA = {
  hits: { title: 'name', image: 'image_url', description: 'description' },
  refinementList: [{ attribute: 'brand' }],
  sortBy: { replicas: ['products_price_asc'] },
};

function makeInitializedProject(overrides: Partial<RootManifest> = {}): string {
  const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'is-cli-add-'));
  writeRootManifest(projectDir, {
    apiVersion: 1,
    flavor: 'react',
    framework: null,
    typescript: true,
    componentsPath: 'src/components',
    aliases: {},
    algolia: { appId: 'APP_ID_XYZ', searchApiKey: 'SEARCH_KEY_XYZ' },
    features: [],
    ...overrides,
  });
  return projectDir;
}

describe('add command', () => {
  test('add search: generates a composite feature named "search"', async () => {
    const projectDir = makeInitializedProject();

    const report = await add({
      projectDir,
      item: 'search',
      indexName: 'products',
      schema: SEARCH_SCHEMA,
    });

    expect(report).toMatchObject({
      apiVersion: 1,
      ok: true,
    });

    const featureDir = path.join(projectDir, 'src/components/search');
    expect(fs.existsSync(path.join(featureDir, 'Hits.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(featureDir, 'Pagination.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(featureDir, 'ClearRefinements.tsx'))).toBe(true);

    const root = JSON.parse(
      fs.readFileSync(path.join(projectDir, 'instantsearch.json'), 'utf8')
    );
    expect(root.features).toEqual([
      { name: 'search', path: 'src/components/search' },
    ]);
  });

  test('add search product-search: uses custom name for the feature', async () => {
    const projectDir = makeInitializedProject();

    const report = await add({
      projectDir,
      item: 'search',
      target: 'product-search',
      indexName: 'products',
      schema: SEARCH_SCHEMA,
    });

    expect(report).toMatchObject({ ok: true });

    const featureDir = path.join(projectDir, 'src/components/product-search');
    expect(fs.existsSync(path.join(featureDir, 'Hits.tsx'))).toBe(true);

    const root = JSON.parse(
      fs.readFileSync(path.join(projectDir, 'instantsearch.json'), 'utf8')
    );
    expect(root.features).toEqual([
      { name: 'product-search', path: 'src/components/product-search' },
    ]);
  });

  test('add refinement-list search: adds a widget to an existing feature', async () => {
    const projectDir = makeInitializedProject();

    await add({
      projectDir,
      item: 'search',
      indexName: 'products',
      schema: SEARCH_SCHEMA,
    });

    const report = await add({
      projectDir,
      item: 'refinement-list',
      target: 'search',
      schema: { refinementList: [{ attribute: 'color' }] },
    });

    expect(report).toMatchObject({ ok: true });

    const featureDir = path.join(projectDir, 'src/components/search');
    expect(fs.existsSync(path.join(featureDir, 'RefinementListColor.tsx'))).toBe(true);
  });

  test('add search: feature has no per-feature provider, uses Index wrapper', async () => {
    const projectDir = makeInitializedProject();

    await add({
      projectDir,
      item: 'search',
      indexName: 'products',
      schema: SEARCH_SCHEMA,
    });

    const featureDir = path.join(projectDir, 'src/components/search');

    expect(fs.existsSync(path.join(featureDir, 'provider.tsx'))).toBe(false);

    const indexFile = fs.readFileSync(
      path.join(featureDir, 'index.tsx'),
      'utf8'
    );
    expect(indexFile).toContain('<Index');
    expect(indexFile).toContain('indexName=');
    expect(indexFile).toContain('"products"');
    expect(indexFile).not.toContain('Provider');
  });

  test('add search: feature does not include SearchBox', async () => {
    const projectDir = makeInitializedProject();

    await add({
      projectDir,
      item: 'search',
      indexName: 'products',
      schema: SEARCH_SCHEMA,
    });

    const featureDir = path.join(projectDir, 'src/components/search');
    expect(fs.existsSync(path.join(featureDir, 'SearchBox.tsx'))).toBe(false);
  });

  test('add bogus: fails with unknown_item', async () => {
    const projectDir = makeInitializedProject();

    const report = await add({
      projectDir,
      item: 'bogus',
    });

    expect(report).toMatchObject({
      ok: false,
      code: 'unknown_item',
    });
  });

  test('add refinement-list without target: fails with target_required', async () => {
    const projectDir = makeInitializedProject();

    const report = await add({
      projectDir,
      item: 'refinement-list',
    });

    expect(report).toMatchObject({
      ok: false,
      code: 'target_required',
    });
  });
});
