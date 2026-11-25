import fs from 'fs';
import os from 'os';
import path from 'path';

import { run } from '../run';

function failOnFirstWrite(sink: string[]) {
  let firstCall = true;
  return (chunk: string) => {
    if (firstCall) {
      firstCall = false;
      throw new Error('disk full');
    }
    sink.push(chunk);
  };
}

describe('internal_error', () => {
  const originalCwd = process.cwd();

  beforeEach(() => {
    const project = fs.mkdtempSync(
      path.join(os.tmpdir(), 'instantsearch-internal-error-')
    );
    fs.writeFileSync(
      path.join(project, 'package.json'),
      JSON.stringify({ dependencies: { 'react-instantsearch': '7.0.0' } })
    );
    process.chdir(project);
  });

  afterEach(() => {
    process.chdir(originalCwd);
  });

  it('emits an internal_error envelope on an unexpected throw when --json is set', async () => {
    const stdout: string[] = [];
    const exitCode = await run(['agents-md', '--json'], {
      stdout: failOnFirstWrite(stdout),
      stderr: () => undefined,
    });

    expect(exitCode).not.toBe(0);
    expect(JSON.parse(stdout.join(''))).toEqual({
      ok: false,
      command: expect.any(String),
      code: 'internal_error',
      message: expect.stringMatching(
        /disk full.*github\.com\/algolia\/instantsearch\/issues/is
      ),
    });
  });

  it('writes a bug-report hint to stderr without --json', async () => {
    const stdout: string[] = [];
    const stderr: string[] = [];
    const exitCode = await run(['agents-md'], {
      stdout: failOnFirstWrite(stdout),
      stderr: (chunk) => stderr.push(chunk),
    });

    expect(exitCode).not.toBe(0);
    expect(stdout.join('')).toBe('');
    expect(stderr.join('')).toMatch(
      /disk full.*github\.com\/algolia\/instantsearch\/issues/is
    );
  });
});
