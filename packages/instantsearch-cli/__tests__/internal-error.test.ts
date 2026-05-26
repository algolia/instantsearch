import { run } from '../src/run';

describe('internal_error', () => {
  it('emits an internal_error envelope on an unexpected throw when --json is set', async () => {
    const stdout: string[] = [];
    let firstCall = true;
    const exitCode = await run(['add', '--json'], {
      stdout: (chunk) => {
        if (firstCall) {
          firstCall = false;
          throw new Error('disk full');
        }
        stdout.push(chunk);
      },
      stderr: () => undefined,
    });

    expect(exitCode).not.toBe(0);
    expect(JSON.parse(stdout.join(''))).toEqual({
      ok: false,
      command: expect.any(String),
      apiVersion: 1,
      code: 'internal_error',
      message: expect.stringMatching(
        /disk full.*github\.com\/algolia\/instantsearch\/issues/is
      ),
    });
  });

  it('writes a bug-report hint to stderr without --json', async () => {
    const stdout: string[] = [];
    const stderr: string[] = [];
    let firstCall = true;
    const exitCode = await run(['add'], {
      stdout: (chunk) => {
        if (firstCall) {
          firstCall = false;
          throw new Error('disk full');
        }
        stdout.push(chunk);
      },
      stderr: (chunk) => stderr.push(chunk),
    });

    expect(exitCode).not.toBe(0);
    expect(stdout.join('')).toBe('');
    expect(stderr.join('')).toMatch(
      /disk full.*github\.com\/algolia\/instantsearch\/issues/is
    );
  });
});
