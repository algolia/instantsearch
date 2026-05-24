import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as childProcess from 'node:child_process';

import { detectPackageManager, installPackages } from '../index';

jest.mock('node:child_process');
const mockedExecFileSync = childProcess.execFileSync as jest.MockedFunction<
  typeof childProcess.execFileSync
>;

function createTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'is-cli-installer-'));
}

describe('detectPackageManager', () => {
  test('yarn.lock → yarn', () => {
    const dir = createTmpDir();
    fs.writeFileSync(path.join(dir, 'yarn.lock'), '');

    expect(detectPackageManager(dir)).toBe('yarn');
  });

  test('package-lock.json → npm', () => {
    const dir = createTmpDir();
    fs.writeFileSync(path.join(dir, 'package-lock.json'), '');

    expect(detectPackageManager(dir)).toBe('npm');
  });

  test('pnpm-lock.yaml → pnpm', () => {
    const dir = createTmpDir();
    fs.writeFileSync(path.join(dir, 'pnpm-lock.yaml'), '');

    expect(detectPackageManager(dir)).toBe('pnpm');
  });

  test('no lockfile → npm', () => {
    const dir = createTmpDir();

    expect(detectPackageManager(dir)).toBe('npm');
  });
});

describe('installPackages', () => {
  beforeEach(() => {
    mockedExecFileSync.mockReset();
  });

  test('yarn: runs yarn add with packages', () => {
    const dir = createTmpDir();
    fs.writeFileSync(path.join(dir, 'yarn.lock'), '');

    const result = installPackages(dir, ['react-instantsearch', 'algoliasearch']);

    expect(result.ok).toBe(true);
    expect(mockedExecFileSync).toHaveBeenCalledWith(
      'yarn',
      ['add', 'react-instantsearch', 'algoliasearch'],
      expect.objectContaining({ cwd: dir })
    );
  });

  test('npm: runs npm install with packages', () => {
    const dir = createTmpDir();
    fs.writeFileSync(path.join(dir, 'package-lock.json'), '');

    const result = installPackages(dir, ['instantsearch.js', 'algoliasearch']);

    expect(result.ok).toBe(true);
    expect(mockedExecFileSync).toHaveBeenCalledWith(
      'npm',
      ['install', 'instantsearch.js', 'algoliasearch'],
      expect.objectContaining({ cwd: dir })
    );
  });

  test('pnpm: runs pnpm add with packages', () => {
    const dir = createTmpDir();
    fs.writeFileSync(path.join(dir, 'pnpm-lock.yaml'), '');

    const result = installPackages(dir, ['react-instantsearch']);

    expect(result.ok).toBe(true);
    expect(mockedExecFileSync).toHaveBeenCalledWith(
      'pnpm',
      ['add', 'react-instantsearch'],
      expect.objectContaining({ cwd: dir })
    );
  });

  test('install failure returns ok: false with code and message', () => {
    const dir = createTmpDir();
    mockedExecFileSync.mockImplementation(() => {
      throw new Error('network error');
    });

    const result = installPackages(dir, ['react-instantsearch']);

    expect(result).toEqual({
      ok: false,
      code: 'install_failed',
      message: expect.stringContaining('network error'),
    });
  });
});
