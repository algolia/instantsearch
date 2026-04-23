import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { addExperience } from '../add-experience';
import { writeRootManifest, type RootManifest } from '../../manifest';

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

describe('add experience command', () => {
  test('happy path: creates experience folder with provider + structural widgets + config', async () => {
    const projectDir = makeInitializedProject();

    const report = await addExperience({
      projectDir,
      name: 'product-search',
      template: 'search',
      indexName: 'products',
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
  });

  test('updates root manifest experiences array', async () => {
    const projectDir = makeInitializedProject();

    await addExperience({
      projectDir,
      name: 'product-search',
      template: 'search',
      indexName: 'products',
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
    });

    if (!report.ok) throw new Error('expected success');

    expect((report as any).filesCreated).toEqual(
      expect.arrayContaining([
        'src/components/product-search/instantsearch.config.json',
        'src/components/product-search/provider.tsx',
        'src/components/product-search/SearchBox.tsx',
        'src/components/product-search/Pagination.tsx',
        'src/components/product-search/ClearRefinements.tsx',
      ])
    );
    expect((report as any).experience).toEqual({
      name: 'product-search',
      path: 'src/components/product-search',
    });
    const nextSteps = (report as any).nextSteps;
    expect(Array.isArray(nextSteps.imports)).toBe(true);
    expect(nextSteps.imports.some((line: string) =>
      line.includes('ProductSearchProvider')
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
    });

    if (!report.ok) throw new Error('expected success');
    const imports = (report as any).nextSteps.imports as string[];
    expect(imports).toContain(
      "import { ProductSearchProvider } from '@/components/product-search/provider';"
    );
    expect(imports).toContain(
      "import { SearchBox } from '@/components/product-search/SearchBox';"
    );
  });

  test('nextSteps.imports fall back to componentsPath when no alias is configured', async () => {
    const projectDir = makeInitializedProject();

    const report = await addExperience({
      projectDir,
      name: 'product-search',
      template: 'search',
      indexName: 'products',
    });

    if (!report.ok) throw new Error('expected success');
    const imports = (report as any).nextSteps.imports as string[];
    expect(imports).toContain(
      "import { ProductSearchProvider } from 'src/components/product-search/provider';"
    );
  });

  test('fails with not_initialized when no root manifest exists', async () => {
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'is-cli-add-exp-'));

    const report = await addExperience({
      projectDir,
      name: 'product-search',
      template: 'search',
      indexName: 'products',
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
    });

    expect(report).toMatchObject({
      ok: false,
      command: 'add experience',
      code: 'unknown_template',
    });
  });
});
