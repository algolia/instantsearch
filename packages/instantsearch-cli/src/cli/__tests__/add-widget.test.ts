jest.mock('algoliasearch', () => ({
  algoliasearch: jest.fn(),
}));

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { algoliasearch } from 'algoliasearch';

import { addExperience } from '../add-experience';
import { addWidget } from '../add-widget';
import {
  writeRootManifest,
  readExperienceManifest,
  readRootManifest,
  type RootManifest,
} from '../../manifest';
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
        facets: { brand: { Apple: 10 }, category: { Audio: 5 } },
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
  const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'is-cli-add-widget-'));
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
  refinementList: { attribute: 'brand' },
  sortBy: { replicas: ['products_price_asc'] },
};

async function seedExperience(projectDir: string, name = 'product-search') {
  await addExperience({
    projectDir,
    name,
    template: 'search',
    indexName: 'products',
    schema: SEARCH_SCHEMA,
  });
}

describe('add widget command', () => {
  test('fails with file_conflict when the widget file already exists', async () => {
    const projectDir = makeInitializedProject();
    await seedExperience(projectDir);

    const hitsPath = path.join(
      projectDir,
      'src/components/product-search/Hits.tsx'
    );
    const originalHits = fs.readFileSync(hitsPath, 'utf8');
    const manifestPath = path.join(
      projectDir,
      'src/components/product-search/instantsearch.config.json'
    );
    const manifestBefore = fs.readFileSync(manifestPath, 'utf8');

    const report = await addWidget({
      projectDir,
      experience: 'product-search',
      widget: 'hits',
      schema: { hits: { title: 'name' } },
    });

    expect(report).toMatchObject({
      ok: false,
      command: 'add widget',
      code: 'file_conflict',
    });
    expect(fs.readFileSync(hitsPath, 'utf8')).toBe(originalHits);
    expect(fs.readFileSync(manifestPath, 'utf8')).toBe(manifestBefore);
  });

  test('auto-suffixes a repeated RefinementList by attribute', async () => {
    const projectDir = makeInitializedProject();
    await seedExperience(projectDir);

    const experienceDir = path.join(projectDir, 'src/components/product-search');
    // Seeded experience already has RefinementList.tsx for 'brand'.
    expect(fs.existsSync(path.join(experienceDir, 'RefinementList.tsx'))).toBe(true);

    const report = await addWidget({
      projectDir,
      experience: 'product-search',
      widget: 'refinement-list',
      schema: { refinementList: { attribute: 'category' } },
    });

    expect(report.ok).toBe(true);
    // Original file untouched.
    expect(fs.existsSync(path.join(experienceDir, 'RefinementList.tsx'))).toBe(true);
    // New file suffixed by PascalCased attribute.
    const suffixed = path.join(experienceDir, 'RefinementListCategory.tsx');
    expect(fs.existsSync(suffixed)).toBe(true);
    expect(fs.readFileSync(suffixed, 'utf8')).toMatch(/attribute="category"/);

    const expManifest = readExperienceManifest(experienceDir);
    // Second entry should reference the suffixed file (not the bare widget name).
    expect(expManifest?.widgets).toContain('RefinementListCategory');
  });

  test('auto-materializes a non-existent experience when --index is provided', async () => {
    const projectDir = makeInitializedProject();

    const report = await addWidget({
      projectDir,
      experience: 'docs-search',
      widget: 'hits',
      indexName: 'docs',
      schema: { hits: { title: 'page_title', image: 'thumbnail' } },
    });

    expect(report.ok).toBe(true);

    const experienceDir = path.join(projectDir, 'src/components/docs-search');
    expect(fs.existsSync(path.join(experienceDir, 'instantsearch.config.json'))).toBe(true);
    expect(fs.existsSync(path.join(experienceDir, 'provider.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(experienceDir, 'Hits.tsx'))).toBe(true);

    const expManifest = readExperienceManifest(experienceDir);
    expect(expManifest?.indexName).toBe('docs');
    expect(expManifest?.widgets).toEqual(['Hits']);

    const root = readRootManifest(projectDir);
    expect(root?.experiences).toEqual([
      { name: 'docs-search', path: 'src/components/docs-search' },
    ]);
  });

  test('auto-materialize without --index errors with index_required and writes nothing', async () => {
    const projectDir = makeInitializedProject();

    const report = await addWidget({
      projectDir,
      experience: 'docs-search',
      widget: 'hits',
      schema: { hits: { title: 'page_title' } },
    });

    expect(report).toMatchObject({
      ok: false,
      command: 'add widget',
      code: 'index_required',
    });
    expect(fs.existsSync(path.join(projectDir, 'src/components/docs-search'))).toBe(false);
    const root = readRootManifest(projectDir);
    expect(root?.experiences).toEqual([]);
  });

  test('success payload includes nextSteps.imports and mountingGuidance', async () => {
    const projectDir = makeInitializedProject();
    await seedExperience(projectDir);

    const report = await addWidget({
      projectDir,
      experience: 'product-search',
      widget: 'refinement-list',
      schema: { refinementList: { attribute: 'category' } },
    });

    if (!report.ok) throw new Error('expected success');
    const nextSteps = (report as any).nextSteps;
    // Auto-suffixed file (RefinementListCategory) aliases the widget export.
    expect(nextSteps.imports).toContain(
      "import { RefinementList as RefinementListCategory } from 'src/components/product-search/RefinementListCategory';"
    );
    expect(nextSteps.mountingGuidance).toMatch(/RefinementListCategory/);
    expect(nextSteps.mountingGuidance).toMatch(/ProductSearchProvider/);
  });

  test('nextSteps includes provider import when auto-materializing an experience', async () => {
    const projectDir = makeInitializedProject();

    const report = await addWidget({
      projectDir,
      experience: 'docs-search',
      widget: 'hits',
      indexName: 'docs',
      schema: { hits: { title: 'page_title' } },
    });

    if (!report.ok) throw new Error('expected success');
    const imports = (report as any).nextSteps.imports as string[];
    expect(imports).toContain(
      "import { DocsSearchProvider } from 'src/components/docs-search/provider';"
    );
    expect(imports).toContain(
      "import { Hits } from 'src/components/docs-search/Hits';"
    );
  });

  test('nextSteps uses JS mounting guidance for the JS flavor', async () => {
    const projectDir = makeInitializedProject({ flavor: 'js', typescript: false });

    const report = await addWidget({
      projectDir,
      experience: 'product-search',
      widget: 'search-box',
      indexName: 'products',
    });

    if (!report.ok) throw new Error('expected success');
    const { imports, mountingGuidance } = (report as any).nextSteps;
    expect(imports).toContain(
      "import { SearchBox } from 'src/components/product-search/SearchBox';"
    );
    expect(imports).toContain(
      "import { startProductSearch } from 'src/components/product-search/provider';"
    );
    expect(mountingGuidance).toMatch(/startProductSearch/);
    expect(mountingGuidance).toMatch(/container|'#/);
  });

  test('adds a single Hits widget to an existing experience', async () => {
    const projectDir = makeInitializedProject();
    // Seed with a partial experience that does NOT include Hits.
    writeRootManifest(projectDir, {
      apiVersion: 1,
      flavor: 'react',
      framework: null,
      typescript: true,
      componentsPath: 'src/components',
      aliases: {},
      algolia: { appId: 'APP_ID_XYZ', searchApiKey: 'SEARCH_KEY_XYZ' },
      experiences: [
        { name: 'product-search', path: 'src/components/product-search' },
      ],
    });
    const experienceDir = path.join(projectDir, 'src/components/product-search');
    fs.mkdirSync(experienceDir, { recursive: true });
    fs.writeFileSync(
      path.join(experienceDir, 'instantsearch.config.json'),
      JSON.stringify(
        { apiVersion: 1, indexName: 'products', widgets: ['SearchBox'] },
        null,
        2
      ) + '\n',
      'utf8'
    );

    const report = await addWidget({
      projectDir,
      experience: 'product-search',
      widget: 'hits',
      schema: { hits: { title: 'name', image: 'image_url' } },
    });

    expect(report).toMatchObject({
      apiVersion: 1,
      ok: true,
      command: 'add widget',
    });
    expect(fs.existsSync(path.join(experienceDir, 'Hits.tsx'))).toBe(true);

    const expManifest = readExperienceManifest(experienceDir);
    expect(expManifest?.widgets).toEqual(['SearchBox', 'Hits']);
  });
});

describe('add widget — interactive prompts', () => {
  test('prompts for index when auto-materializing an experience', async () => {
    const projectDir = makeInitializedProject();

    const report = await addWidget({
      projectDir,
      experience: 'brand-new',
      widget: 'search-box',
      prompter: createScriptedPrompter([
        'my-products', // indexName prompt
      ]),
    });

    expect(report).toMatchObject({ ok: true, command: 'add widget' });

    const root = JSON.parse(
      fs.readFileSync(path.join(projectDir, 'instantsearch.json'), 'utf8')
    );
    expect(root.experiences).toContainEqual(
      expect.objectContaining({ name: 'brand-new' })
    );

    const config = readExperienceManifest(
      path.join(projectDir, 'src/components/brand-new')
    );
    expect(config?.indexName).toBe('my-products');
  });

  test('no prompt needed when index is provided via flag', async () => {
    const projectDir = makeInitializedProject();

    const report = await addWidget({
      projectDir,
      experience: 'brand-new',
      widget: 'search-box',
      indexName: 'my-products',
      prompter: createScriptedPrompter([]), // empty — no prompts expected
    });

    expect(report).toMatchObject({ ok: true, command: 'add widget' });
  });
});
