import fs from 'fs';
import os from 'os';
import path from 'path';

import nock from 'nock';

import { runIntrospect } from '../src/introspect';
import { serializeManifest, type Manifest } from '../src/manifest';

import { captureIO, readEnvelope } from './__utils__/helpers';

function manifestFixture(overrides: {
  appId?: string;
  searchApiKey?: string;
} = {}): Manifest {
  return {
    flavor: 'react',
    framework: 'vite',
    typescript: true,
    componentsPath: 'src/components',
    libPath: 'src/lib',
    aliases: {},
    algolia: {
      appId: overrides.appId ?? 'MANIFEST_APP',
      searchApiKey: overrides.searchApiKey ?? 'MANIFEST_KEY',
    },
    features: [],
  };
}

function writeManifestFile(cwd: string, manifest: Manifest): void {
  fs.writeFileSync(
    path.join(cwd, 'instantsearch.json'),
    serializeManifest(manifest),
    'utf8'
  );
}

type Captured = {
  appId?: string;
  apiKey?: string;
};

function mockSearch(
  indexName: string,
  reply:
    | { kind: 'ok'; body: unknown }
    | { kind: 'status'; status: number; body?: unknown }
    | { kind: 'error' },
  captured: Captured = {}
): Captured {
  const scope = nock(/algolia(net)?\.(net|com)/)
    .post(`/1/indexes/${encodeURIComponent(indexName)}/query`)
    .query(true);
  if (reply.kind === 'error') {
    scope.replyWithError({ code: 'ECONNREFUSED', message: 'connection refused' });
  } else {
    scope.reply(function () {
      const req = this.req as { headers: Record<string, string> };
      captured.appId = req.headers['x-algolia-application-id'];
      captured.apiKey = req.headers['x-algolia-api-key'];
      return reply.kind === 'ok'
        ? [200, reply.body]
        : [reply.status, reply.body ?? { message: 'error' }];
    });
  }
  return captured;
}

function searchResponseFixture(
  overrides: { facets?: Record<string, unknown>; hits?: unknown[] } = {}
) {
  return {
    hits: overrides.hits ?? [
      {
        _highlightResult: {
          name: { value: 'name', matchLevel: 'none', matchedWords: [] },
          description: {
            value: 'desc',
            matchLevel: 'none',
            matchedWords: [],
          },
        },
      },
    ],
    facets: overrides.facets ?? { brand: { Apple: 1 }, categories: { Box: 1 } },
    nbHits: 1,
    page: 0,
    nbPages: 1,
    hitsPerPage: 20,
    processingTimeMS: 1,
    query: '',
    params: '',
  };
}

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'instantsearch-introspect-'));
}

beforeAll(() => {
  nock.disableNetConnect();
});

afterEach(() => {
  nock.cleanAll();
});

afterAll(() => {
  nock.enableNetConnect();
});

describe('introspect', () => {
  let tempDirs: string[];

  beforeEach(() => {
    tempDirs = [];
  });

  afterEach(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  function tempDir(): string {
    const dir = makeTempDir();
    tempDirs.push(dir);
    return dir;
  }

  it('returns facets and searchable attributes with --app-id + --search-api-key', async () => {
    const captured = mockSearch('instant_search', {
      kind: 'ok',
      body: searchResponseFixture(),
    });
    const capture = captureIO();

    const exitCode = await runIntrospect(
      {
        cwd: tempDir(),
        json: true,
        index: 'instant_search',
        appId: 'FLAG_APP',
        searchApiKey: 'FLAG_KEY',
      },
      capture.io
    );

    expect(exitCode).toBe(0);
    expect(capture.stderr.join('')).toBe('');
    expect(readEnvelope(capture.stdout)).toEqual({
      ok: true,
      command: 'introspect',
      filesCreated: [],
      nextSteps: [],
      data: {
        facets: ['brand', 'categories'],
        searchableAttributes: ['name', 'description'],
      },
    });
    expect(captured).toEqual({ appId: 'FLAG_APP', apiKey: 'FLAG_KEY' });
  });

  it('reads credentials from instantsearch.json when no flags are passed', async () => {
    const cwd = tempDir();
    writeManifestFile(
      cwd,
      manifestFixture({ appId: 'MANIFEST_APP', searchApiKey: 'MANIFEST_KEY' })
    );

    const captured = mockSearch('instant_search', {
      kind: 'ok',
      body: searchResponseFixture(),
    });
    const capture = captureIO();

    const exitCode = await runIntrospect(
      { cwd, json: true, index: 'instant_search' },
      capture.io
    );

    expect(exitCode).toBe(0);
    expect(captured).toEqual({
      appId: 'MANIFEST_APP',
      apiKey: 'MANIFEST_KEY',
    });
  });

  it('prefers flags over manifest when both are present', async () => {
    const cwd = tempDir();
    writeManifestFile(
      cwd,
      manifestFixture({ appId: 'MANIFEST_APP', searchApiKey: 'MANIFEST_KEY' })
    );

    const captured = mockSearch('instant_search', {
      kind: 'ok',
      body: searchResponseFixture(),
    });

    await runIntrospect(
      {
        cwd,
        json: true,
        index: 'instant_search',
        appId: 'FLAG_APP',
        searchApiKey: 'FLAG_KEY',
      },
      captureIO().io
    );

    expect(captured.appId).toBe('FLAG_APP');
    expect(captured.apiKey).toBe('FLAG_KEY');
  });

  it('refuses with missing_required_flag when no manifest and no credential flags are provided', async () => {
    const capture = captureIO();
    const exitCode = await runIntrospect(
      { cwd: tempDir(), json: true, index: 'instant_search' },
      capture.io
    );

    expect(exitCode).not.toBe(0);
    expect(capture.stderr.join('')).toBe('');
    expect(readEnvelope(capture.stdout)).toMatchObject({
      ok: false,
      command: 'introspect',
      code: 'missing_required_flag',
      message: expect.stringContaining('--app-id'),
    });
  });

  it('refuses with missing_required_flag when only --app-id is passed (no --search-api-key, no manifest)', async () => {
    const capture = captureIO();
    const exitCode = await runIntrospect(
      {
        cwd: tempDir(),
        json: true,
        index: 'instant_search',
        appId: 'FLAG_APP',
      },
      capture.io
    );

    expect(exitCode).not.toBe(0);
    expect(readEnvelope(capture.stdout)).toMatchObject({
      ok: false,
      code: 'missing_required_flag',
    });
  });

  it('refuses with missing_required_flag when --index is missing', async () => {
    const capture = captureIO();
    const exitCode = await runIntrospect(
      {
        cwd: tempDir(),
        json: true,
        appId: 'FLAG_APP',
        searchApiKey: 'FLAG_KEY',
      },
      capture.io
    );

    expect(exitCode).not.toBe(0);
    expect(readEnvelope(capture.stdout)).toMatchObject({
      ok: false,
      code: 'missing_required_flag',
      message: expect.stringContaining('--index'),
    });
  });

  it('surfaces index_not_found when the API returns a 404', async () => {
    mockSearch('does_not_exist', {
      kind: 'status',
      status: 404,
      body: { message: 'Index does_not_exist does not exist.' },
    });
    const capture = captureIO();

    const exitCode = await runIntrospect(
      {
        cwd: tempDir(),
        json: true,
        index: 'does_not_exist',
        appId: 'FLAG_APP',
        searchApiKey: 'FLAG_KEY',
      },
      capture.io
    );

    expect(exitCode).not.toBe(0);
    expect(readEnvelope(capture.stdout)).toMatchObject({
      ok: false,
      command: 'introspect',
      code: 'index_not_found',
      message: expect.stringContaining('does_not_exist'),
    });
  });

  it.each([401, 403])(
    'surfaces credentials_invalid when Algolia returns %i',
    async (status) => {
      mockSearch('instant_search', {
        kind: 'status',
        status,
        body: { message: 'Invalid Application-ID or API key' },
      });
      const capture = captureIO();

      const exitCode = await runIntrospect(
        {
          cwd: tempDir(),
          json: true,
          index: 'instant_search',
          appId: 'FLAG_APP',
          searchApiKey: 'FLAG_KEY',
        },
        capture.io
      );

      expect(exitCode).not.toBe(0);
      expect(readEnvelope(capture.stdout)).toMatchObject({
        ok: false,
        command: 'introspect',
        code: 'credentials_invalid',
      });
    }
  );

  it('surfaces algolia_error for other non-404 API errors', async () => {
    mockSearch('instant_search', {
      kind: 'status',
      status: 500,
      body: { message: 'Internal server error' },
    });
    const capture = captureIO();

    const exitCode = await runIntrospect(
      {
        cwd: tempDir(),
        json: true,
        index: 'instant_search',
        appId: 'FLAG_APP',
        searchApiKey: 'FLAG_KEY',
      },
      capture.io
    );

    expect(exitCode).not.toBe(0);
    expect(readEnvelope(capture.stdout)).toMatchObject({
      ok: false,
      command: 'introspect',
      code: 'algolia_error',
    });
  });

  it('surfaces algolia_error for transport errors', async () => {
    mockSearch('instant_search', { kind: 'error' });
    const capture = captureIO();

    const exitCode = await runIntrospect(
      {
        cwd: tempDir(),
        json: true,
        index: 'instant_search',
        appId: 'FLAG_APP',
        searchApiKey: 'FLAG_KEY',
      },
      capture.io
    );

    expect(exitCode).not.toBe(0);
    expect(readEnvelope(capture.stdout)).toMatchObject({
      ok: false,
      code: 'algolia_error',
    });
  });

  it('passes through an index with no facets and no hits as empty arrays', async () => {
    mockSearch('instant_search', {
      kind: 'ok',
      body: searchResponseFixture({ facets: {}, hits: [] }),
    });
    const capture = captureIO();

    const exitCode = await runIntrospect(
      {
        cwd: tempDir(),
        json: true,
        index: 'instant_search',
        appId: 'FLAG_APP',
        searchApiKey: 'FLAG_KEY',
      },
      capture.io
    );

    expect(exitCode).toBe(0);
    expect(readEnvelope(capture.stdout)).toEqual({
      ok: true,
      command: 'introspect',
      filesCreated: [],
      nextSteps: [],
      data: {
        facets: [],
        searchableAttributes: [],
      },
    });
  });

  it('treats an empty _highlightResult as zero searchable attributes', async () => {
    mockSearch('instant_search', {
      kind: 'ok',
      body: searchResponseFixture({
        hits: [{ objectID: 'a', _highlightResult: {} }],
      }),
    });
    const capture = captureIO();

    const exitCode = await runIntrospect(
      {
        cwd: tempDir(),
        json: true,
        index: 'instant_search',
        appId: 'FLAG_APP',
        searchApiKey: 'FLAG_KEY',
      },
      capture.io
    );

    expect(exitCode).toBe(0);
    expect(readEnvelope(capture.stdout)).toMatchObject({
      ok: true,
      data: {
        facets: ['brand', 'categories'],
        searchableAttributes: [],
      },
    });
  });

  it('returns top-level attribute names for nested and array _highlightResult entries', async () => {
    mockSearch('instant_search', {
      kind: 'ok',
      body: searchResponseFixture({
        hits: [
          {
            objectID: 'a',
            _highlightResult: {
              name: { value: 'n', matchLevel: 'none', matchedWords: [] },
              hierarchical_categories: {
                lvl0: { value: 'l0', matchLevel: 'none', matchedWords: [] },
                lvl1: { value: 'l1', matchLevel: 'none', matchedWords: [] },
              },
              tags: [
                { value: 't1', matchLevel: 'none', matchedWords: [] },
                { value: 't2', matchLevel: 'none', matchedWords: [] },
              ],
            },
          },
        ],
      }),
    });
    const capture = captureIO();

    const exitCode = await runIntrospect(
      {
        cwd: tempDir(),
        json: true,
        index: 'instant_search',
        appId: 'FLAG_APP',
        searchApiKey: 'FLAG_KEY',
      },
      capture.io
    );

    expect(exitCode).toBe(0);
    expect(readEnvelope(capture.stdout)).toMatchObject({
      ok: true,
      data: {
        searchableAttributes: ['name', 'hierarchical_categories', 'tags'],
      },
    });
  });

  it('refuses with invalid_manifest when the manifest is malformed JSON', async () => {
    const cwd = tempDir();
    fs.writeFileSync(
      path.join(cwd, 'instantsearch.json'),
      '{ not valid json',
      'utf8'
    );

    const capture = captureIO();
    const exitCode = await runIntrospect(
      { cwd, json: true, index: 'instant_search' },
      capture.io
    );

    expect(exitCode).not.toBe(0);
    expect(readEnvelope(capture.stdout)).toMatchObject({
      ok: false,
      code: 'invalid_manifest',
      message: expect.stringContaining('instantsearch.json'),
    });
  });

  it('emits human-readable output when --json is not set', async () => {
    mockSearch('instant_search', {
      kind: 'ok',
      body: searchResponseFixture(),
    });
    const capture = captureIO();

    const exitCode = await runIntrospect(
      {
        cwd: tempDir(),
        json: false,
        index: 'instant_search',
        appId: 'FLAG_APP',
        searchApiKey: 'FLAG_KEY',
      },
      capture.io
    );

    expect(exitCode).toBe(0);
    const stdout = capture.stdout.join('');
    expect(stdout).toContain('instant_search');
    expect(stdout).toContain('brand');
    expect(stdout).toContain('name');
    expect(stdout.trimStart().startsWith('{')).toBe(false);
  });

  it('emits human-readable error on stderr when --json is not set', async () => {
    const capture = captureIO();
    const exitCode = await runIntrospect(
      { cwd: tempDir(), json: false, index: 'instant_search' },
      capture.io
    );

    expect(exitCode).not.toBe(0);
    expect(capture.stdout.join('')).toBe('');
    expect(capture.stderr.join('')).toContain('credentials');
  });
});
