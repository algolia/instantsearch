import fs from 'fs';
import os from 'os';
import path from 'path';

import { looksLikeEmptyProject, runInit, type Installer } from '../init';
import { readManifest } from '../manifest';

const FIXTURES_ROOT = path.join(__dirname, 'fixtures', 'detector');
const COMPANY_ENV = [
  'ALGOLIA_APP_ID=latency',
  'ALGOLIA_SEARCH_API_KEY=search-key',
  'ALGOLIA_INDEX_NAME=instant_search',
  'ALGOLIA_WRITE_API_KEY=write-secret',
].join('\n');

const noopInstaller: Installer = async () => undefined;

function project(
  fixture: string | null,
  files: Record<string, string> = {}
): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'instantsearch-init-env-'));
  if (fixture)
    fs.cpSync(path.join(FIXTURES_ROOT, fixture), dir, { recursive: true });
  for (const [name, contents] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), contents, 'utf8');
  }
  return dir;
}

async function init(cwd: string) {
  const stdout: string[] = [];
  const exitCode = await runInit(
    { cwd, json: true, yes: true, env: {}, installer: noopInstaller },
    { stdout: (c) => stdout.push(c), stderr: () => undefined }
  );
  return { exitCode, envelope: JSON.parse(stdout.join('')) };
}

describe('init with credentials already in the project env', () => {
  it('generates a Vite client that reads VITE_ variables and adds them to .env.local', async () => {
    const cwd = project('react-vite-ts', { '.env.local': COMPANY_ENV });
    const { exitCode, envelope } = await init(cwd);

    expect(exitCode).toBe(0);
    expect(envelope.filesModified).toEqual([path.join(cwd, '.env.local')]);

    const client = fs.readFileSync(
      path.join(cwd, 'src/lib/algolia-client.ts'),
      'utf8'
    );
    expect(client).toContain('import.meta.env.VITE_ALGOLIA_APP_ID');
    expect(client).toContain('import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY');
    expect(client).toContain(
      'export const indexName = import.meta.env.VITE_ALGOLIA_INDEX_NAME'
    );
    expect(client).not.toContain('search-key');

    const env = fs.readFileSync(path.join(cwd, '.env.local'), 'utf8');
    expect(env).toContain('VITE_ALGOLIA_APP_ID=latency');
    expect(env).toContain('VITE_ALGOLIA_SEARCH_API_KEY=search-key');
    expect(env).not.toMatch(/VITE_ALGOLIA_WRITE/);

    const provider = fs.readFileSync(
      path.join(cwd, 'src/lib/algolia-provider.tsx'),
      'utf8'
    );
    expect(provider).toContain(
      '<InstantSearch searchClient={searchClient} insights>'
    );

    expect(
      readManifest(path.join(cwd, 'instantsearch.json'), { command: 'init' })
    ).toMatchObject({
      ok: true,
      manifest: {
        algolia: {
          appId: 'latency',
          searchApiKey: 'search-key',
          indexName: 'instant_search',
        },
      },
    });

    const steps = envelope.nextSteps.join('\n');
    expect(steps).toContain('indexName export');
    expect(steps).toContain('ALGOLIA_WRITE_API_KEY');
    expect(steps).toContain('npx create-instantsearch-app introspect --json');
    expect(steps).toContain('npx create-instantsearch-app agents-md');
  });

  it('uses NEXT_PUBLIC_ variables for the Next.js App Router and warns about cacheComponents', async () => {
    const cwd = project('next-app', {
      '.env.local': COMPANY_ENV,
      'next.config.ts': 'export default { cacheComponents: true };\n',
    });
    const { exitCode, envelope } = await init(cwd);

    expect(exitCode).toBe(0);
    const client = fs.readFileSync(
      path.join(cwd, 'lib/algolia-client.js'),
      'utf8'
    );
    expect(client).toContain("process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? ''");
    expect(fs.readFileSync(path.join(cwd, '.env.local'), 'utf8')).toContain(
      'NEXT_PUBLIC_ALGOLIA_INDEX_NAME=instant_search'
    );
    expect(envelope.nextSteps.join('\n')).toContain('connection()');
  });

  it('still inlines values passed as flags', async () => {
    const cwd = project('react-vite-ts', { '.env.local': COMPANY_ENV });
    const stdout: string[] = [];
    await runInit(
      {
        cwd,
        json: true,
        yes: true,
        env: {},
        installer: noopInstaller,
        appId: 'FLAG_APP',
        searchApiKey: 'FLAG_KEY',
      },
      { stdout: (c) => stdout.push(c), stderr: () => undefined }
    );
    const client = fs.readFileSync(
      path.join(cwd, 'src/lib/algolia-client.ts'),
      'utf8'
    );
    expect(client).toContain('"FLAG_APP"');
    expect(JSON.parse(stdout.join('')).filesModified).toBeUndefined();
  });
});

describe('init in a folder without an app', () => {
  it('hands off to Create InstantSearch App with the project credentials', async () => {
    const cwd = project(null, {
      'package.json': JSON.stringify({
        name: 'search-project',
        devDependencies: { vitest: '^3' },
      }),
      '.env.local': COMPANY_ENV,
    });
    const { exitCode, envelope } = await init(cwd);

    expect(exitCode).toBe(1);
    expect(envelope).toMatchObject({
      ok: false,
      command: 'init',
      code: 'no_app_detected',
    });
    const steps = envelope.nextSteps.join('\n');
    expect(steps).toContain('data.createInstantSearchAppCommand');
    expect(steps).toContain(
      'npx create-instantsearch-app search-app --template "React InstantSearch" --app-id latency --api-key search-key --index-name instant_search --enable-insights --no-interactive'
    );
    expect(steps).not.toContain('write-secret');
    expect(fs.existsSync(path.join(cwd, 'instantsearch.json'))).toBe(false);
  });

  it('keeps unsupported_flavor for real non-React apps', async () => {
    const { envelope } = await init(project('vue'));
    expect(envelope.code).toBe('unsupported_flavor');
  });

  it.each([
    [null, {}, true],
    [null, { 'package.json': '{"devDependencies":{"vitest":"^3"}}' }, true],
    ['vue', {}, false],
    [null, { 'index.html': '<div id="app"></div>' }, false],
  ])('looksLikeEmptyProject(%s, %j) is %s', (fixture, files, expected) => {
    expect(looksLikeEmptyProject(project(fixture, files))).toBe(expected);
  });
});
