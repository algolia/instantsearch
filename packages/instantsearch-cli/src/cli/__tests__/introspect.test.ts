jest.mock('algoliasearch', () => ({
  algoliasearch: jest.fn(),
}));

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { algoliasearch } from 'algoliasearch';

import { introspect } from '../introspect';
import { writeRootManifest, type RootManifest } from '../../manifest';

const mockedAlgoliasearch = algoliasearch as unknown as jest.Mock;

function mockAlgolia({
  hits,
  facets,
  getSettings,
}: {
  hits?: Array<Record<string, unknown>>;
  facets?: Record<string, unknown>;
  getSettings?: () => Promise<unknown>;
} = {}): void {
  mockedAlgoliasearch.mockImplementation(() => ({
    searchSingleIndex: ({ searchParams }: { indexName: string; searchParams: Record<string, unknown> }) => {
      if (searchParams.facets) {
        return Promise.resolve({
          hits: [],
          facets: facets ?? { brand: { Apple: 10 }, category: { Electronics: 5 } },
        });
      }
      return Promise.resolve({
        hits: hits ?? [
          {
            objectID: '1',
            name: 'Widget',
            image_url: 'https://example.com/w.jpg',
            _highlightResult: {
              name: { value: 'Widget' },
            },
          },
        ],
      });
    },
    getSettings:
      getSettings ??
      (() => Promise.resolve({ replicas: ['products_price_asc', 'products_price_desc'] })),
  }));
}

function makeInitializedProject(overrides: Partial<RootManifest> = {}): string {
  const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'is-cli-introspect-'));
  writeRootManifest(projectDir, {
    apiVersion: 1,
    flavor: 'react',
    framework: null,
    typescript: true,
    componentsPath: 'src/components',
    aliases: {},
    algolia: { appId: 'APP_ID', searchApiKey: 'SEARCH_KEY' },
    features: [],
    ...overrides,
  });
  return projectDir;
}

beforeEach(() => {
  mockedAlgoliasearch.mockReset();
  mockAlgolia();
});

describe('introspect command', () => {
  test('happy path: returns attributes, imageCandidates, facets, and replicas', async () => {
    const projectDir = makeInitializedProject();

    const report = await introspect({
      projectDir,
      indexName: 'products',
    });

    expect(report).toMatchObject({
      apiVersion: 1,
      ok: true,
      command: 'introspect',
      indexName: 'products',
      attributes: ['name'],
      imageCandidates: ['image_url'],
      facets: ['brand', 'category'],
      replicas: ['products_price_asc', 'products_price_desc'],
      warnings: [],
    });
  });

  test('partial: replicas settings_forbidden → ok with warning, empty replicas', async () => {
    mockAlgolia({
      getSettings: () => Promise.reject({ status: 403 }),
    });
    const projectDir = makeInitializedProject();

    const report = await introspect({
      projectDir,
      indexName: 'products',
    });

    expect(report.ok).toBe(true);
    expect(report).toMatchObject({
      command: 'introspect',
      attributes: ['name'],
      facets: ['brand', 'category'],
      replicas: [],
    });
    const warnings = (report as Record<string, unknown>).warnings as string[];
    expect(warnings.length).toBe(1);
    expect(warnings[0]).toMatch(/settings/i);
  });

  test('partial: no facets configured → ok with empty facets, no warning', async () => {
    mockAlgolia({ facets: {} });
    const projectDir = makeInitializedProject();

    const report = await introspect({
      projectDir,
      indexName: 'products',
    });

    expect(report.ok).toBe(true);
    expect(report).toMatchObject({
      command: 'introspect',
      facets: [],
      replicas: ['products_price_asc', 'products_price_desc'],
      warnings: [],
    });
  });

  test('partial: no replicas configured → ok with empty replicas, no warning', async () => {
    mockAlgolia({
      getSettings: () => Promise.resolve({ replicas: [] }),
    });
    const projectDir = makeInitializedProject();

    const report = await introspect({
      projectDir,
      indexName: 'products',
    });

    expect(report.ok).toBe(true);
    expect(report).toMatchObject({
      command: 'introspect',
      replicas: [],
      warnings: [],
    });
  });

  test('total failure: credentials invalid → failure report', async () => {
    mockedAlgoliasearch.mockImplementation(() => ({
      searchSingleIndex: () => Promise.reject({ status: 403 }),
      getSettings: () => Promise.reject({ status: 403 }),
    }));
    const projectDir = makeInitializedProject();

    const report = await introspect({
      projectDir,
      indexName: 'products',
    });

    expect(report).toMatchObject({
      apiVersion: 1,
      ok: false,
      command: 'introspect',
      code: 'credentials_invalid',
    });
  });

  test('not initialized: no manifest and no explicit credentials → failure', async () => {
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'is-cli-introspect-empty-'));

    const report = await introspect({
      projectDir,
      indexName: 'products',
    });

    expect(report).toMatchObject({
      apiVersion: 1,
      ok: false,
      command: 'introspect',
      code: 'not_initialized',
    });
  });

  test('invalid manifest and no explicit credentials → invalid_manifest', async () => {
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'is-cli-introspect-invalid-'));
    fs.writeFileSync(
      path.join(projectDir, 'instantsearch.json'),
      '{not json',
      'utf8'
    );

    const report = await introspect({
      projectDir,
      indexName: 'products',
    });

    expect(report).toMatchObject({
      apiVersion: 1,
      ok: false,
      command: 'introspect',
      code: 'invalid_manifest',
    });
    expect(mockedAlgoliasearch).not.toHaveBeenCalled();
  });

  test('explicit credentials bypass manifest', async () => {
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'is-cli-introspect-nocfg-'));

    const report = await introspect({
      projectDir,
      indexName: 'products',
      appId: 'EXPLICIT_APP',
      searchApiKey: 'EXPLICIT_KEY',
    });

    expect(report.ok).toBe(true);
    expect(report).toMatchObject({
      command: 'introspect',
      indexName: 'products',
      attributes: ['name'],
    });
  });
});
