import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

jest.mock('algoliasearch', () => ({
  algoliasearch: jest.fn(),
}));

import { algoliasearch } from 'algoliasearch';

import { init } from '../init';
import { createScriptedPrompter } from '../../prompter';

const mockedAlgoliasearch = algoliasearch as unknown as jest.Mock;

const FIXTURES = path.join(
  __dirname,
  '..',
  '..',
  'detector',
  '__tests__',
  'fixtures'
);

function copyFixture(name: string): string {
  const dest = fs.mkdtempSync(path.join(os.tmpdir(), 'is-cli-init-'));
  fs.cpSync(path.join(FIXTURES, name), dest, { recursive: true });
  return dest;
}

function mockAlgolia(
  searchImpl: (params: unknown) => Promise<unknown>
): void {
  mockedAlgoliasearch.mockImplementation(() => ({
    searchSingleIndex: searchImpl,
  }));
}

beforeEach(() => {
  mockedAlgoliasearch.mockReset();
});

describe('init command', () => {
  test('happy path: writes root manifest + algolia-client.ts, returns success payload', async () => {
    const projectDir = copyFixture('react-ts');
    mockAlgolia(() => Promise.resolve({ hits: [] }));

    const report = await init({
      projectDir,
      flavor: 'react',
      appId: 'APP_ID_XYZ',
      searchApiKey: 'SEARCH_KEY_XYZ',
      componentsPath: 'src/components',
    });

    expect(report).toMatchObject({
      apiVersion: 1,
      ok: true,
      command: 'init',
      manifestUpdated: 'instantsearch.json',
    });
    if (!report.ok) throw new Error('expected success');
    expect((report as any).filesCreated).toEqual(
      expect.arrayContaining(['instantsearch.json', 'src/lib/algolia-client.ts'])
    );

    const manifest = JSON.parse(
      fs.readFileSync(path.join(projectDir, 'instantsearch.json'), 'utf8')
    );
    expect(manifest).toMatchObject({
      apiVersion: 1,
      flavor: 'react',
      framework: null,
      typescript: true,
      componentsPath: 'src/components',
      algolia: { appId: 'APP_ID_XYZ', searchApiKey: 'SEARCH_KEY_XYZ' },
      experiences: [],
    });

    const clientFile = fs.readFileSync(
      path.join(projectDir, 'src', 'lib', 'algolia-client.ts'),
      'utf8'
    );
    expect(clientFile).toContain("'APP_ID_XYZ'");
    expect(clientFile).toContain("'SEARCH_KEY_XYZ'");
  });

  test('invalid credentials: returns credentials_invalid and writes no files', async () => {
    const projectDir = copyFixture('react-ts');
    mockAlgolia(() =>
      Promise.reject(Object.assign(new Error('Invalid key'), { status: 403 }))
    );

    const report = await init({
      projectDir,
      flavor: 'react',
      appId: 'APP',
      searchApiKey: 'BAD',
      componentsPath: 'src/components',
    });

    expect(report).toMatchObject({
      apiVersion: 1,
      ok: false,
      command: 'init',
      code: 'credentials_invalid',
    });
    expect(fs.existsSync(path.join(projectDir, 'instantsearch.json'))).toBe(
      false
    );
    expect(
      fs.existsSync(path.join(projectDir, 'src', 'lib', 'algolia-client.ts'))
    ).toBe(false);
  });

  test('unsupported framework: returns unsupported_framework without calling Algolia', async () => {
    const projectDir = copyFixture('unsupported');

    const report = await init({
      projectDir,
      appId: 'APP',
      searchApiKey: 'KEY',
    });

    expect(report).toMatchObject({
      apiVersion: 1,
      ok: false,
      command: 'init',
      code: 'unsupported_framework',
    });
    expect(mockedAlgoliasearch).not.toHaveBeenCalled();
    expect(fs.existsSync(path.join(projectDir, 'instantsearch.json'))).toBe(
      false
    );
  });

  test('ambiguous Next.js layout: --framework nextjs override proceeds past ambiguity', async () => {
    const projectDir = copyFixture('next-ambiguous');
    mockAlgolia(() => Promise.resolve({ hits: [] }));

    const report = await init({
      projectDir,
      framework: 'nextjs',
      appId: 'APP',
      searchApiKey: 'KEY',
    });

    expect(report.ok).toBe(true);
    const manifest = JSON.parse(
      fs.readFileSync(path.join(projectDir, 'instantsearch.json'), 'utf8')
    );
    expect(manifest).toMatchObject({
      flavor: 'react',
      framework: 'nextjs',
    });
  });

  test('ambiguous Next.js layout without --framework: fails with unsupported_framework', async () => {
    const projectDir = copyFixture('next-ambiguous');

    const report = await init({
      projectDir,
      appId: 'APP',
      searchApiKey: 'KEY',
    });

    expect(report).toMatchObject({
      ok: false,
      command: 'init',
      code: 'unsupported_framework',
    });
    expect(fs.existsSync(path.join(projectDir, 'instantsearch.json'))).toBe(
      false
    );
  });

  test('Next.js App Router fixture: manifest records framework "nextjs"', async () => {
    const projectDir = copyFixture('nextjs-ts');
    mockAlgolia(() => Promise.resolve({ hits: [] }));

    const report = await init({
      projectDir,
      appId: 'APP',
      searchApiKey: 'KEY',
    });

    expect(report.ok).toBe(true);
    const manifest = JSON.parse(
      fs.readFileSync(path.join(projectDir, 'instantsearch.json'), 'utf8')
    );
    expect(manifest).toMatchObject({
      flavor: 'react',
      framework: 'nextjs',
      typescript: true,
    });
  });

  test('JS-only fixture: manifest records flavor "js", framework null', async () => {
    const projectDir = copyFixture('js-only');
    mockAlgolia(() => Promise.resolve({ hits: [] }));

    const report = await init({
      projectDir,
      appId: 'APP',
      searchApiKey: 'KEY',
    });

    expect(report.ok).toBe(true);
    const manifest = JSON.parse(
      fs.readFileSync(path.join(projectDir, 'instantsearch.json'), 'utf8')
    );
    expect(manifest).toMatchObject({
      flavor: 'js',
      framework: null,
      typescript: false,
    });
    expect(
      fs.existsSync(path.join(projectDir, 'src', 'lib', 'algolia-client.js'))
    ).toBe(true);
  });

  test('falls back to Detector when flavor/framework flags are omitted', async () => {
    const projectDir = copyFixture('react-js');
    mockAlgolia(() => Promise.resolve({ hits: [] }));

    const report = await init({
      projectDir,
      appId: 'APP',
      searchApiKey: 'KEY',
    });

    expect(report.ok).toBe(true);
    const manifest = JSON.parse(
      fs.readFileSync(path.join(projectDir, 'instantsearch.json'), 'utf8')
    );
    expect(manifest).toMatchObject({
      flavor: 'react',
      framework: null,
      typescript: false,
    });
    expect(
      fs.existsSync(path.join(projectDir, 'src', 'lib', 'algolia-client.js'))
    ).toBe(true);
  });
});

describe('init command — interactive prompts', () => {
  test('prompts for appId and searchKey when not provided', async () => {
    const projectDir = copyFixture('react-ts');
    mockAlgolia(() => Promise.resolve({ hits: [] }));

    const report = await init({
      projectDir,
      flavor: 'react',
      componentsPath: 'src/components',
      prompter: createScriptedPrompter([
        'MY_APP_ID',    // appId
        'MY_SEARCH_KEY', // searchKey
      ]),
    });

    expect(report).toMatchObject({ ok: true, command: 'init' });
    const manifest = JSON.parse(
      fs.readFileSync(path.join(projectDir, 'instantsearch.json'), 'utf8')
    );
    expect(manifest.algolia).toEqual({
      appId: 'MY_APP_ID',
      searchApiKey: 'MY_SEARCH_KEY',
    });
  });

  test('prompts for componentsPath when not provided', async () => {
    const projectDir = copyFixture('react-ts');
    mockAlgolia(() => Promise.resolve({ hits: [] }));

    const report = await init({
      projectDir,
      flavor: 'react',
      appId: 'APP',
      searchApiKey: 'KEY',
      prompter: createScriptedPrompter([
        'src/ui', // componentsPath
      ]),
    });

    expect(report).toMatchObject({ ok: true, command: 'init' });
    const manifest = JSON.parse(
      fs.readFileSync(path.join(projectDir, 'instantsearch.json'), 'utf8')
    );
    expect(manifest.componentsPath).toBe('src/ui');
  });

  test('prompts for all three missing inputs in order', async () => {
    const projectDir = copyFixture('react-ts');
    mockAlgolia(() => Promise.resolve({ hits: [] }));

    const report = await init({
      projectDir,
      flavor: 'react',
      prompter: createScriptedPrompter([
        'PROMPTED_APP',   // appId
        'PROMPTED_KEY',   // searchKey
        'src/widgets',    // componentsPath
      ]),
    });

    expect(report).toMatchObject({ ok: true, command: 'init' });
    const manifest = JSON.parse(
      fs.readFileSync(path.join(projectDir, 'instantsearch.json'), 'utf8')
    );
    expect(manifest.algolia.appId).toBe('PROMPTED_APP');
    expect(manifest.algolia.searchApiKey).toBe('PROMPTED_KEY');
    expect(manifest.componentsPath).toBe('src/widgets');
  });

  test('flags take precedence over prompts; prompts fill only the gaps', async () => {
    const projectDir = copyFixture('react-ts');
    mockAlgolia(() => Promise.resolve({ hits: [] }));

    const report = await init({
      projectDir,
      flavor: 'react',
      appId: 'FLAG_APP',
      // no searchApiKey — should be prompted
      componentsPath: 'src/components',
      prompter: createScriptedPrompter([
        'PROMPTED_KEY', // searchKey only
      ]),
    });

    expect(report).toMatchObject({ ok: true, command: 'init' });
    const manifest = JSON.parse(
      fs.readFileSync(path.join(projectDir, 'instantsearch.json'), 'utf8')
    );
    expect(manifest.algolia.appId).toBe('FLAG_APP');
    expect(manifest.algolia.searchApiKey).toBe('PROMPTED_KEY');
  });

  test('no prompts called when all flags are supplied (non-interactive path unchanged)', async () => {
    const projectDir = copyFixture('react-ts');
    mockAlgolia(() => Promise.resolve({ hits: [] }));

    // ScriptedPrompter with no answers — if any prompt fires it will throw.
    const report = await init({
      projectDir,
      flavor: 'react',
      appId: 'APP',
      searchApiKey: 'KEY',
      componentsPath: 'src/components',
      prompter: createScriptedPrompter([]),
    });

    expect(report).toMatchObject({ ok: true, command: 'init' });
  });

  test('prompts to confirm detected flavor when --flavor flag omitted', async () => {
    const projectDir = copyFixture('react-ts');
    mockAlgolia(() => Promise.resolve({ hits: [] }));

    // The detector finds 'react'. Prompter returns 'js' to override it.
    const report = await init({
      projectDir,
      appId: 'APP',
      searchApiKey: 'KEY',
      componentsPath: 'src/components',
      prompter: createScriptedPrompter([
        'js', // flavor selection override
      ]),
    });

    expect(report).toMatchObject({ ok: true, command: 'init' });
    const manifest = JSON.parse(
      fs.readFileSync(path.join(projectDir, 'instantsearch.json'), 'utf8')
    );
    expect(manifest.flavor).toBe('js');
  });

  test('no flavor prompt when --flavor flag is supplied', async () => {
    const projectDir = copyFixture('react-ts');
    mockAlgolia(() => Promise.resolve({ hits: [] }));

    const report = await init({
      projectDir,
      flavor: 'react',
      appId: 'APP',
      searchApiKey: 'KEY',
      componentsPath: 'src/components',
      prompter: createScriptedPrompter([]),
    });

    expect(report).toMatchObject({ ok: true, command: 'init' });
    const manifest = JSON.parse(
      fs.readFileSync(path.join(projectDir, 'instantsearch.json'), 'utf8')
    );
    expect(manifest.flavor).toBe('react');
  });

  test('prompts to confirm detected framework when --framework flag omitted', async () => {
    const projectDir = copyFixture('nextjs-ts');
    mockAlgolia(() => Promise.resolve({ hits: [] }));

    // Detector finds 'nextjs'. Prompter returns 'none' to use plain react instead.
    const report = await init({
      projectDir,
      appId: 'APP',
      searchApiKey: 'KEY',
      componentsPath: 'src/components',
      prompter: createScriptedPrompter([
        'react', // flavor selection (unchanged)
        'none',  // framework selection: plain react
      ]),
    });

    expect(report).toMatchObject({ ok: true, command: 'init' });
    const manifest = JSON.parse(
      fs.readFileSync(path.join(projectDir, 'instantsearch.json'), 'utf8')
    );
    expect(manifest.framework).toBeNull();
  });
});
