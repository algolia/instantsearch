import fs from 'fs';
import os from 'os';
import path from 'path';

import {
  runInit,
  deriveLibPath,
  type InitOptions,
  type PromptFn,
  type Installer,
} from '../src/init';
import { readManifest, type Manifest } from '../src/manifest';

const FIXTURES_ROOT = path.join(__dirname, 'fixtures', 'detector');

type CapturedIO = {
  stdout: string[];
  stderr: string[];
  io: { stdout: (chunk: string) => void; stderr: (chunk: string) => void };
};

function captureIO(): CapturedIO {
  const stdout: string[] = [];
  const stderr: string[] = [];
  return {
    stdout,
    stderr,
    io: {
      stdout: (chunk: string) => stdout.push(chunk),
      stderr: (chunk: string) => stderr.push(chunk),
    },
  };
}

function copyFixture(name: string): string {
  const src = path.join(FIXTURES_ROOT, name);
  const dest = fs.mkdtempSync(path.join(os.tmpdir(), `instantsearch-init-${name}-`));
  copyRecursive(src, dest);
  return dest;
}

function copyRecursive(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcEntry = path.join(src, entry.name);
    const destEntry = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcEntry, destEntry);
    } else {
      fs.copyFileSync(srcEntry, destEntry);
    }
  }
}

function noopInstaller(): Installer {
  return async () => undefined;
}

function trackingInstaller(): Installer & { calls: Array<{ packages: string[]; cwd: string }> } {
  const calls: Array<{ packages: string[]; cwd: string }> = [];
  const installer = (async (packages, { cwd }) => {
    calls.push({ packages, cwd });
  }) as Installer & { calls: typeof calls };
  installer.calls = calls;
  return installer;
}

function readEnvelope(stdout: string[]): Record<string, unknown> {
  return JSON.parse(stdout.join(''));
}

function baseOptions(overrides: Partial<InitOptions> & { cwd: string }): InitOptions {
  return {
    json: true,
    yes: true,
    appId: 'APP_ID',
    searchApiKey: 'SEARCH_KEY',
    installer: noopInstaller(),
    ...overrides,
  };
}

describe('init', () => {
  let tempDirs: string[];

  beforeEach(() => {
    tempDirs = [];
  });

  afterEach(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  function fixture(name: string): string {
    const dir = copyFixture(name);
    tempDirs.push(dir);
    return dir;
  }

  it('creates manifest, client, and provider in a React + Vite + TS project', async () => {
    const cwd = fixture('react-vite-ts');
    const capture = captureIO();

    const exitCode = await runInit(baseOptions({ cwd }), capture.io);

    expect(exitCode).toBe(0);
    expect(capture.stderr.join('')).toBe('');

    const envelope = readEnvelope(capture.stdout);
    expect(envelope).toMatchObject({
      ok: true,
      command: 'init',
      filesCreated: expect.any(Array),
    });

    const filesCreated = envelope.filesCreated as string[];
    expect(filesCreated).toEqual([
      path.join(cwd, 'instantsearch.json'),
      path.join(cwd, 'src/lib/algolia-client.ts'),
      path.join(cwd, 'src/lib/algolia-provider.tsx'),
    ]);

    for (const file of filesCreated) {
      expect(fs.existsSync(file)).toBe(true);
    }

    const manifestResult = readManifest(path.join(cwd, 'instantsearch.json'), {
      command: 'init',
    });
    expect(manifestResult).toMatchObject({
      ok: true,
      manifest: {
        flavor: 'react',
        typescript: true,
        componentsPath: 'src/components',
        libPath: 'src/lib',
        algolia: { appId: 'APP_ID', searchApiKey: 'SEARCH_KEY' },
        features: [],
      },
    });
    expect((manifestResult as { manifest: Manifest }).manifest.framework).toBeUndefined();

    const clientSource = fs.readFileSync(
      path.join(cwd, 'src/lib/algolia-client.ts'),
      'utf8'
    );
    expect(clientSource).toContain('searchClient');
    expect(clientSource).toContain('"APP_ID"');
    expect(clientSource).toContain('"SEARCH_KEY"');
    expect(clientSource).toMatch(/cache/i);

    const providerSource = fs.readFileSync(
      path.join(cwd, 'src/lib/algolia-provider.tsx'),
      'utf8'
    );
    expect(providerSource).toContain("from 'react-instantsearch'");
    expect(providerSource).not.toContain("'use client'");
    expect(providerSource).not.toMatch(/indexName=/);

    const importHint = (envelope as { nextSteps: string[] }).nextSteps.join('\n');
    expect(importHint).toContain('./src/lib/algolia-provider');
    expect(importHint).not.toContain(cwd);
    expect(importHint).not.toMatch(/\.(tsx|jsx|ts|js)['"`]/);
  });

  it('renders a Next App Router provider with InstantSearchNext and the "use client" directive', async () => {
    const cwd = fixture('next-app');
    const capture = captureIO();

    const exitCode = await runInit(baseOptions({ cwd }), capture.io);

    expect(exitCode).toBe(0);

    const envelope = readEnvelope(capture.stdout);
    const filesCreated = envelope.filesCreated as string[];

    // next-app fixture has no tsconfig.json, so typescript is false; use .jsx + .js
    expect(filesCreated).toEqual([
      path.join(cwd, 'instantsearch.json'),
      path.join(cwd, 'src/lib/algolia-client.js'),
      path.join(cwd, 'src/lib/algolia-provider.jsx'),
    ]);

    const providerSource = fs.readFileSync(
      path.join(cwd, 'src/lib/algolia-provider.jsx'),
      'utf8'
    );
    expect(providerSource.startsWith("'use client';")).toBe(true);
    expect(providerSource).toContain(
      "import { InstantSearchNext } from 'react-instantsearch-nextjs';"
    );
    expect(providerSource).toContain('<InstantSearchNext');

    const manifestResult = readManifest(path.join(cwd, 'instantsearch.json'), {
      command: 'init',
    });
    expect(manifestResult).toMatchObject({
      ok: true,
      manifest: { flavor: 'react', framework: 'next-app' } as Partial<Manifest>,
    });
  });

  it('installs react-instantsearch-nextjs only for Next App Router', async () => {
    const reactCwd = fixture('react-vite-ts');
    const nextCwd = fixture('next-app');

    const reactInstaller = trackingInstaller();
    const nextInstaller = trackingInstaller();

    await runInit(
      baseOptions({ cwd: reactCwd, installer: reactInstaller }),
      captureIO().io
    );
    await runInit(
      baseOptions({ cwd: nextCwd, installer: nextInstaller }),
      captureIO().io
    );

    expect(reactInstaller.calls).toEqual([
      expect.objectContaining({
        packages: ['algoliasearch', 'react-instantsearch'],
      }),
    ]);
    expect(nextInstaller.calls).toEqual([
      expect.objectContaining({
        packages: [
          'algoliasearch',
          'react-instantsearch',
          'react-instantsearch-nextjs',
        ],
      }),
    ]);
  });

  it('respects --components-path and --lib-path overrides', async () => {
    const cwd = fixture('react-vite-ts');
    const capture = captureIO();

    const exitCode = await runInit(
      baseOptions({
        cwd,
        componentsPath: 'app/widgets',
        libPath: 'app/algolia',
      }),
      capture.io
    );

    expect(exitCode).toBe(0);

    const envelope = readEnvelope(capture.stdout);
    expect(envelope.filesCreated).toEqual([
      path.join(cwd, 'instantsearch.json'),
      path.join(cwd, 'app/algolia/algolia-client.ts'),
      path.join(cwd, 'app/algolia/algolia-provider.tsx'),
    ]);

    const manifestResult = readManifest(path.join(cwd, 'instantsearch.json'), {
      command: 'init',
    });
    expect(manifestResult).toMatchObject({
      ok: true,
      manifest: {
        componentsPath: 'app/widgets',
        libPath: 'app/algolia',
      },
    });
  });

  describe('json/yes contract', () => {
    it('re-derives yes from json so JSON-mode never reaches the install prompt', async () => {
      const cwd = fixture('react-vite-ts');
      const capture = captureIO();
      const installer = trackingInstaller();

      const exitCode = await runInit(
        {
          cwd,
          json: true,
          yes: false,
          appId: 'APP_ID',
          searchApiKey: 'SEARCH_KEY',
          componentsPath: 'src/components',
          libPath: 'src/lib',
          installer,
        },
        capture.io
      );

      expect(exitCode).toBe(0);
      expect(installer.calls.length).toBeGreaterThan(0);
    });
  });

  describe('install prompt', () => {
    it('refuses with install_failed when the package manager exits non-zero', async () => {
      const cwd = fixture('react-vite-ts');
      const capture = captureIO();

      const failingInstaller: Installer = async () => {
        throw new Error('npm install exited with code 1');
      };

      const exitCode = await runInit(
        baseOptions({ cwd, installer: failingInstaller }),
        capture.io
      );

      expect(exitCode).not.toBe(0);
      expect(fs.existsSync(path.join(cwd, 'instantsearch.json'))).toBe(false);
      expect(readEnvelope(capture.stdout)).toMatchObject({
        ok: false,
        command: 'init',
        code: 'install_failed',
        message: expect.stringContaining('npm install'),
      });
    });

    it('treats a cancelled install prompt as cancelled, not install_declined', async () => {
      const cwd = fixture('react-vite-ts');
      const capture = captureIO();
      const installer = trackingInstaller();

      // prompts() returns {} on Ctrl-C — the install confirm answer key is absent.
      const prompt: PromptFn = async (questions) => {
        const answers: Record<string, unknown> = {};
        for (const question of questions) {
          if (question.name === 'installConfirmed') {
            // simulate cancellation: do not return this key
            continue;
          }
          if (question.name === 'appId') answers.appId = 'APP_ID';
          else if (question.name === 'searchApiKey')
            answers.searchApiKey = 'SEARCH_KEY';
          else if (question.name === 'componentsPath')
            answers.componentsPath = 'src/components';
          else if (question.name === 'libPath') answers.libPath = 'src/lib';
        }
        return answers;
      };

      const exitCode = await runInit(
        { cwd, json: false, yes: false, prompt, installer },
        capture.io
      );

      expect(exitCode).not.toBe(0);
      expect(installer.calls).toEqual([]);
      const stderr = capture.stderr.join('');
      expect(stderr).not.toContain('Cannot proceed without installing');
      expect(stderr).toMatch(/cancel/i);
    });

    it('refuses with install_declined when the user declines in interactive mode', async () => {
      const cwd = fixture('react-vite-ts');
      const capture = captureIO();
      const installer = trackingInstaller();

      const prompt: PromptFn = async (questions) => {
        const answers: Record<string, unknown> = {};
        for (const question of questions) {
          if (question.name === 'installConfirmed') {
            answers.installConfirmed = false;
          } else if (question.name === 'appId') {
            answers.appId = 'APP_ID';
          } else if (question.name === 'searchApiKey') {
            answers.searchApiKey = 'SEARCH_KEY';
          } else if (question.name === 'componentsPath') {
            answers.componentsPath = 'src/components';
          } else if (question.name === 'libPath') {
            answers.libPath = 'src/lib';
          }
        }
        return answers;
      };

      const exitCode = await runInit(
        { cwd, json: false, yes: false, prompt, installer },
        capture.io
      );

      expect(exitCode).not.toBe(0);
      expect(installer.calls).toEqual([]);
      expect(fs.existsSync(path.join(cwd, 'instantsearch.json'))).toBe(false);
      expect(capture.stderr.join('')).toContain('Cannot proceed without installing');
    });
  });

  describe('--framework override', () => {
    it('resolves ambiguous_framework when --framework next-app is passed', async () => {
      const cwd = fixture('next-ambiguous');
      const capture = captureIO();

      const exitCode = await runInit(
        baseOptions({ cwd, framework: 'next-app' }),
        capture.io
      );

      expect(exitCode).toBe(0);
      expect(capture.stderr.join('')).toBe('');

      const manifestResult = readManifest(path.join(cwd, 'instantsearch.json'), {
        command: 'init',
      });
      expect(manifestResult).toMatchObject({
        ok: true,
        manifest: { flavor: 'react', framework: 'next-app' } as Partial<Manifest>,
      });
    });

    it('trusts --framework next-app even when next is not in package.json deps', async () => {
      const cwd = fixture('react-vite-ts');
      const capture = captureIO();

      const exitCode = await runInit(
        baseOptions({ cwd, framework: 'next-app' }),
        capture.io
      );

      expect(exitCode).toBe(0);
      const manifestResult = readManifest(path.join(cwd, 'instantsearch.json'), {
        command: 'init',
      });
      expect(manifestResult).toMatchObject({
        ok: true,
        manifest: { flavor: 'react', framework: 'next-app' } as Partial<Manifest>,
      });
    });

    it('still refuses with ambiguous_framework when --framework is omitted', async () => {
      const cwd = fixture('next-ambiguous');
      const capture = captureIO();

      const exitCode = await runInit(baseOptions({ cwd }), capture.io);

      expect(exitCode).not.toBe(0);
      expect(readEnvelope(capture.stdout)).toMatchObject({
        ok: false,
        code: 'ambiguous_framework',
      });
    });
  });

  describe('deriveLibPath', () => {
    it('maps src/components to src/lib', () => {
      expect(deriveLibPath('src/components')).toBe('src/lib');
    });

    it('maps components to lib', () => {
      expect(deriveLibPath('components')).toBe('lib');
    });
  });

  it('derives libPath from componentsPath when only --components-path is passed', async () => {
    const cwd = fixture('react-vite-ts');
    const capture = captureIO();

    await runInit(
      baseOptions({ cwd, componentsPath: 'components' }),
      capture.io
    );

    const envelope = readEnvelope(capture.stdout);
    expect(envelope.filesCreated).toEqual([
      path.join(cwd, 'instantsearch.json'),
      path.join(cwd, 'lib/algolia-client.ts'),
      path.join(cwd, 'lib/algolia-provider.tsx'),
    ]);

    const manifestResult = readManifest(path.join(cwd, 'instantsearch.json'), {
      command: 'init',
    });
    expect(manifestResult).toMatchObject({
      ok: true,
      manifest: {
        componentsPath: 'components',
        libPath: 'lib',
      },
    });
  });

  it('refuses with manifest_exists when re-run on a project with an existing manifest', async () => {
    const cwd = fixture('react-vite-ts');
    const firstCapture = captureIO();
    await runInit(baseOptions({ cwd }), firstCapture.io);

    const secondCapture = captureIO();
    const exitCode = await runInit(baseOptions({ cwd }), secondCapture.io);

    expect(exitCode).not.toBe(0);
    expect(secondCapture.stderr.join('')).toBe('');
    expect(readEnvelope(secondCapture.stdout)).toMatchObject({
      ok: false,
      command: 'init',
      code: 'manifest_exists',
      message: expect.stringContaining('instantsearch.json'),
    });
  });

  it('prefers manifest_exists over a detection failure on re-runs', async () => {
    const cwd = fixture('vanilla'); // detector would refuse this with unsupported_flavor
    fs.writeFileSync(
      path.join(cwd, 'instantsearch.json'),
      '{"flavor":"react","typescript":true,"componentsPath":"src/components","libPath":"src/lib","aliases":{},"algolia":{"appId":"X","searchApiKey":"Y"},"features":[]}',
      'utf8'
    );
    const capture = captureIO();

    const exitCode = await runInit(baseOptions({ cwd }), capture.io);

    expect(exitCode).not.toBe(0);
    expect(readEnvelope(capture.stdout)).toMatchObject({
      ok: false,
      command: 'init',
      code: 'manifest_exists',
    });
  });

  it('refuses with missing_required_flag when --yes mode lacks --app-id', async () => {
    const cwd = fixture('react-vite-ts');
    const capture = captureIO();

    const exitCode = await runInit(
      {
        cwd,
        json: true,
        yes: true,
        searchApiKey: 'SEARCH_KEY',
        installer: noopInstaller(),
      },
      capture.io
    );

    expect(exitCode).not.toBe(0);
    expect(readEnvelope(capture.stdout)).toMatchObject({
      ok: false,
      command: 'init',
      code: 'missing_required_flag',
      message: expect.stringContaining('--app-id'),
    });
  });

  it('refuses with missing_required_flag when --yes mode lacks --search-api-key', async () => {
    const cwd = fixture('react-vite-ts');
    const capture = captureIO();

    const exitCode = await runInit(
      {
        cwd,
        json: true,
        yes: true,
        appId: 'APP_ID',
        installer: noopInstaller(),
      },
      capture.io
    );

    expect(exitCode).not.toBe(0);
    expect(readEnvelope(capture.stdout)).toMatchObject({
      ok: false,
      command: 'init',
      code: 'missing_required_flag',
      message: expect.stringContaining('--search-api-key'),
    });
  });

  it('prompts for credentials and paths in interactive mode', async () => {
    const cwd = fixture('react-vite-ts');
    const capture = captureIO();

    const askedQuestions: string[] = [];
    const prompt: PromptFn = async (questions) => {
      for (const question of questions) askedQuestions.push(question.name);
      const answers: Record<string, unknown> = {
        appId: 'INTERACTIVE_APP',
        searchApiKey: 'INTERACTIVE_KEY',
        componentsPath: 'src/widgets',
        libPath: 'src/integrations',
      };
      for (const question of questions) {
        if (question.name === 'installConfirmed') {
          answers.installConfirmed = true;
        }
      }
      return answers;
    };

    const exitCode = await runInit(
      {
        cwd,
        json: false,
        yes: false,
        prompt,
        installer: noopInstaller(),
      },
      capture.io
    );

    expect(exitCode).toBe(0);
    expect(askedQuestions).toEqual([
      'appId',
      'searchApiKey',
      'componentsPath',
      'libPath',
      'installConfirmed',
    ]);

    const manifestResult = readManifest(path.join(cwd, 'instantsearch.json'), {
      command: 'init',
    });
    expect(manifestResult).toMatchObject({
      ok: true,
      manifest: {
        componentsPath: 'src/widgets',
        libPath: 'src/integrations',
        algolia: {
          appId: 'INTERACTIVE_APP',
          searchApiKey: 'INTERACTIVE_KEY',
        },
      },
    });
  });

  it('refuses to overwrite an existing algolia-client file', async () => {
    const cwd = fixture('react-vite-ts');
    fs.mkdirSync(path.join(cwd, 'src', 'lib'), { recursive: true });
    fs.writeFileSync(
      path.join(cwd, 'src', 'lib', 'algolia-client.ts'),
      '// pre-existing\n',
      'utf8'
    );
    const capture = captureIO();

    const exitCode = await runInit(baseOptions({ cwd }), capture.io);

    expect(exitCode).not.toBe(0);
    expect(readEnvelope(capture.stdout)).toMatchObject({
      ok: false,
      command: 'init',
      code: 'write_failed',
    });
    // Original file content preserved.
    expect(
      fs.readFileSync(path.join(cwd, 'src', 'lib', 'algolia-client.ts'), 'utf8')
    ).toBe('// pre-existing\n');
  });

  it('surfaces write_failed when scaffolding fails on a filesystem error', async () => {
    const cwd = fixture('react-vite-ts');
    // Block mkdirSync by placing a regular file where the libDir should go.
    fs.mkdirSync(path.join(cwd, 'src'), { recursive: true });
    fs.writeFileSync(path.join(cwd, 'src', 'lib'), 'blocker', 'utf8');
    const capture = captureIO();

    const exitCode = await runInit(baseOptions({ cwd }), capture.io);

    expect(exitCode).not.toBe(0);
    expect(readEnvelope(capture.stdout)).toMatchObject({
      ok: false,
      command: 'init',
      code: 'write_failed',
    });
  });

  it('treats a cancelled credentials prompt as cancelled, not missing_required_flag', async () => {
    const cwd = fixture('react-vite-ts');
    const capture = captureIO();

    // prompts() returns {} on Ctrl-C
    const prompt: PromptFn = async () => ({});

    const exitCode = await runInit(
      {
        cwd,
        json: false,
        yes: false,
        prompt,
        installer: noopInstaller(),
      },
      capture.io
    );

    expect(exitCode).not.toBe(0);
    expect(fs.existsSync(path.join(cwd, 'instantsearch.json'))).toBe(false);
    const stderr = capture.stderr.join('');
    expect(stderr).not.toMatch(/--app-id/);
    expect(stderr).toMatch(/cancel/i);
  });
});
