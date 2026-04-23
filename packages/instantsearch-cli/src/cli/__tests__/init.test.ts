import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

jest.mock('algoliasearch', () => ({
  algoliasearch: jest.fn(),
}));

import { algoliasearch } from 'algoliasearch';

import { init } from '../init';

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
