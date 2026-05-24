import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const PACKAGE_ROOT = path.resolve(__dirname, '..', '..', '..');
const CLI_ENTRY = path.join(PACKAGE_ROOT, 'src', 'cli', 'index.ts');
const TSX_BIN = path.join(PACKAGE_ROOT, 'node_modules', '.bin', 'tsx');

function runCli(
  args: string[],
  cwd: string
): { stdout: string; stderr: string; exitCode: number } {
  const result = spawnSync(TSX_BIN, [CLI_ENTRY, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, NODE_NO_WARNINGS: '1' },
  });
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    exitCode: result.status ?? 0,
  };
}

function mkTmp(prefix = 'is-cli-surface-'): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

describe('CLI binary surface under --json', () => {
  test('init --json with no flags: stderr empty, JSON failure on stdout, exit 1', () => {
    const cwd = mkTmp();
    const { stdout, stderr, exitCode } = runCli(['init', '--json'], cwd);

    expect(stderr).toBe('');
    expect(exitCode).toBe(1);
    const report = JSON.parse(stdout.trim());
    expect(report).toMatchObject({
      apiVersion: 1,
      ok: false,
      command: 'init',
      code: 'missing_required_flag',
    });
  });

  test('unknown command with --json: stderr empty, JSON failure on stdout, exit 1', () => {
    const cwd = mkTmp();
    const { stdout, stderr, exitCode } = runCli(['bogus', '--json'], cwd);

    expect(stderr).toBe('');
    expect(exitCode).toBe(1);
    const report = JSON.parse(stdout.trim());
    expect(report.ok).toBe(false);
    expect(typeof report.code).toBe('string');
    expect(report.code.length).toBeGreaterThan(0);
  });

  test('init --json without package.json: stderr empty, exit 1', () => {
    const cwd = mkTmp();

    const { stdout, stderr, exitCode } = runCli(
      ['init', '--json', '--app-id', 'APP', '--search-api-key', 'KEY'],
      cwd
    );

    expect(stderr).toBe('');
    expect(exitCode).toBe(1);
    const report = JSON.parse(stdout.trim());
    expect(report).toMatchObject({
      apiVersion: 1,
      ok: false,
      command: 'init',
      code: 'unsupported_framework',
    });
  });

  test('unknown option with --json: stderr empty, JSON failure on stdout, exit 1', () => {
    const cwd = mkTmp();

    const { stdout, stderr, exitCode } = runCli(
      [
        'init',
        '--json',
        '--app-id',
        'APP',
        '--search-api-key',
        'KEY',
        '--totally-made-up-flag',
      ],
      cwd
    );

    expect(stderr).toBe('');
    expect(exitCode).toBe(1);
    const report = JSON.parse(stdout.trim());
    expect(report.ok).toBe(false);
    expect(report.code).toBe('unknown_option');
  });

  test('introspect --json without --index: stderr empty, JSON failure on stdout, exit 1', () => {
    const cwd = mkTmp();
    const { stdout, stderr, exitCode } = runCli(
      ['introspect', '--json'],
      cwd
    );

    expect(stderr).toBe('');
    expect(exitCode).toBe(1);
    const report = JSON.parse(stdout.trim());
    expect(report).toMatchObject({
      apiVersion: 1,
      ok: false,
      command: 'introspect',
      code: 'missing_required_flag',
    });
  });

  test('introspect --json in uninitialized project: stderr empty, exit 1', () => {
    const cwd = mkTmp();
    const { stdout, stderr, exitCode } = runCli(
      ['introspect', '--json', '--index', 'products'],
      cwd
    );

    expect(stderr).toBe('');
    expect(exitCode).toBe(1);
    const report = JSON.parse(stdout.trim());
    expect(report).toMatchObject({
      apiVersion: 1,
      ok: false,
      command: 'introspect',
      code: 'not_initialized',
    });
  });

  test('add search --json in uninitialized project: stderr empty, exit 1', () => {
    const cwd = mkTmp();

    const { stdout, stderr, exitCode } = runCli(
      [
        'add',
        'search',
        '--json',
        '--index',
        'products',
        '--hits-title',
        'name',
        '--refinement-list-attribute',
        'brand',
        '--sort-by-replicas',
        'products_price_asc',
      ],
      cwd
    );

    expect(stderr).toBe('');
    expect(exitCode).toBe(1);
    const report = JSON.parse(stdout.trim());
    expect(report).toMatchObject({
      apiVersion: 1,
      ok: false,
      code: 'not_initialized',
    });
  });
});
