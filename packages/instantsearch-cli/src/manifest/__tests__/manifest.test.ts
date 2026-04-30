import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  readRootManifest,
  readRootManifestResult,
  writeRootManifest,
  readExperienceManifest,
  readExperienceManifestResult,
  writeExperienceManifest,
  addExperienceToRoot,
  resolveExperience,
  ROOT_MANIFEST_FILENAME,
  EXPERIENCE_MANIFEST_FILENAME,
  type RootManifest,
} from '../index';

function makeTempProject(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'is-cli-manifest-'));
}

describe('manifest', () => {
  test('writeRootManifest then readRootManifest returns the same content', () => {
    const projectDir = makeTempProject();
    const manifest = {
      apiVersion: 1 as const,
      flavor: 'react' as const,
      framework: null,
      typescript: true,
      componentsPath: 'src/components',
      aliases: { components: '@/components' },
      algolia: { appId: 'APP', searchApiKey: 'KEY' },
      features: [],
    };

    writeRootManifest(projectDir, manifest);

    expect(readRootManifest(projectDir)).toEqual(manifest);
  });

  test('writeRootManifest creates instantsearch.json at the project root', () => {
    const projectDir = makeTempProject();

    writeRootManifest(projectDir, { apiVersion: 1, flavor: 'react' });

    const written = fs.readFileSync(
      path.join(projectDir, ROOT_MANIFEST_FILENAME),
      'utf8'
    );
    expect(JSON.parse(written)).toEqual({ apiVersion: 1, flavor: 'react' });
  });

  test('readRootManifest returns null when no manifest exists', () => {
    const projectDir = makeTempProject();

    expect(readRootManifest(projectDir)).toBeNull();
  });

  test('readRootManifestResult reports invalid JSON', () => {
    const projectDir = makeTempProject();
    fs.writeFileSync(
      path.join(projectDir, ROOT_MANIFEST_FILENAME),
      '{not json',
      'utf8'
    );

    expect(readRootManifestResult(projectDir)).toMatchObject({
      ok: false,
      code: 'invalid_manifest',
      message: expect.stringContaining('invalid JSON'),
    });
  });

  test('readRootManifestResult validates required fields', () => {
    const projectDir = makeTempProject();
    writeRootManifest(projectDir, { apiVersion: 1, flavor: 'react' });

    expect(readRootManifestResult(projectDir)).toMatchObject({
      ok: false,
      code: 'invalid_manifest',
    });
  });

  test('writeExperienceManifest then readExperienceManifest returns the same content', () => {
    const projectDir = makeTempProject();
    const experienceDir = path.join(projectDir, 'src/components/product-search');
    fs.mkdirSync(experienceDir, { recursive: true });

    const manifest = {
      apiVersion: 1 as const,
      indexName: 'products',
      widgets: ['SearchBox', 'Pagination', 'ClearRefinements'],
    };

    writeExperienceManifest(experienceDir, manifest);

    expect(readExperienceManifest(experienceDir)).toEqual(manifest);
    expect(
      fs.existsSync(path.join(experienceDir, EXPERIENCE_MANIFEST_FILENAME))
    ).toBe(true);
  });

  test('readExperienceManifest returns null when no manifest exists', () => {
    const projectDir = makeTempProject();
    expect(readExperienceManifest(projectDir)).toBeNull();
  });

  test('readExperienceManifestResult validates required fields', () => {
    const projectDir = makeTempProject();
    writeExperienceManifest(projectDir, { apiVersion: 1 });

    expect(readExperienceManifestResult(projectDir)).toMatchObject({
      ok: false,
      code: 'invalid_manifest',
    });
  });

  test('addExperienceToRoot appends an entry to the experiences array', () => {
    const projectDir = makeTempProject();
    const manifest: RootManifest = {
      apiVersion: 1,
      flavor: 'react',
      framework: null,
      typescript: true,
      componentsPath: 'src/components',
      aliases: {},
      algolia: { appId: 'APP', searchApiKey: 'KEY' },
      features: [],
    };
    writeRootManifest(projectDir, manifest);

    addExperienceToRoot(projectDir, manifest, {
      name: 'product-search',
      path: 'src/components/product-search',
    });

    expect(readRootManifest(projectDir)?.features).toEqual([
      { name: 'product-search', path: 'src/components/product-search' },
    ]);
  });

  test('addExperienceToRoot preserves existing experiences', () => {
    const projectDir = makeTempProject();
    const manifest: RootManifest = {
      apiVersion: 1,
      flavor: 'react',
      framework: null,
      typescript: true,
      componentsPath: 'src/components',
      aliases: {},
      algolia: { appId: 'APP', searchApiKey: 'KEY' },
      features: [
        { name: 'product-search', path: 'src/components/product-search' },
      ],
    };
    writeRootManifest(projectDir, manifest);

    addExperienceToRoot(projectDir, manifest, {
      name: 'docs-search',
      path: 'src/components/docs-search',
    });

    expect(readRootManifest(projectDir)?.features).toEqual([
      { name: 'product-search', path: 'src/components/product-search' },
      { name: 'docs-search', path: 'src/components/docs-search' },
    ]);
  });

  test('resolveExperience merges root manifest fields with the experience config', () => {
    const resolved = resolveExperience(
      {
        apiVersion: 1,
        flavor: 'react',
        framework: null,
        typescript: true,
        componentsPath: 'src/components',
        aliases: {},
        algolia: { appId: 'APP', searchApiKey: 'KEY' },
        features: [],
      },
      {
        name: 'product-search',
        experience: {
          apiVersion: 1,
          indexName: 'products',
          widgets: ['SearchBox', 'Pagination', 'ClearRefinements'],
        },
      }
    );

    expect(resolved).toMatchObject({
      flavor: 'react',
      framework: null,
      typescript: true,
      componentsPath: 'src/components',
      algolia: { appId: 'APP', searchApiKey: 'KEY' },
      experience: {
        name: 'product-search',
        indexName: 'products',
        widgets: ['SearchBox', 'Pagination', 'ClearRefinements'],
      },
    });
  });

  test('experience manifest round-trips the schema block (hits / refinementList / sortBy)', () => {
    const projectDir = makeTempProject();
    const experienceDir = path.join(projectDir, 'src/components/product-search');
    fs.mkdirSync(experienceDir, { recursive: true });

    const manifest = {
      apiVersion: 1 as const,
      indexName: 'products',
      widgets: ['Hits', 'RefinementList', 'SortBy'],
      schema: {
        hits: { title: 'name', image: 'image_url', description: 'description' },
        refinementList: [{ attribute: 'brand' }],
        sortBy: { replicas: ['products_price_asc', 'products_price_desc'] },
      },
    };

    writeExperienceManifest(experienceDir, manifest);

    expect(readExperienceManifest(experienceDir)).toEqual(manifest);
  });

  test('resolveExperience propagates the schema block into the resolved manifest', () => {
    const resolved = resolveExperience(
      {
        apiVersion: 1,
        flavor: 'react',
        framework: null,
        typescript: true,
        componentsPath: 'src/components',
        aliases: {},
        algolia: { appId: 'APP', searchApiKey: 'KEY' },
        features: [],
      },
      {
        name: 'product-search',
        experience: {
          apiVersion: 1,
          indexName: 'products',
          widgets: ['Hits', 'RefinementList', 'SortBy'],
          schema: {
            hits: { title: 'name', image: 'image_url' },
            refinementList: [{ attribute: 'brand' }],
            sortBy: { replicas: ['products_price_asc'] },
          },
        },
      }
    );

    expect(resolved.experience.schema).toEqual({
      hits: { title: 'name', image: 'image_url' },
      refinementList: [{ attribute: 'brand' }],
      sortBy: { replicas: ['products_price_asc'] },
    });
  });
});
