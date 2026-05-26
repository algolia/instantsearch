import { PROGRAM_NAME } from '../src/program';

import { runCapturing } from './__utils__/helpers';

describe('unknown flag', () => {
  it('emits an unknown_flag failure envelope when --json is set', async () => {
    const { exitCode, stdout, stderr } = await runCapturing([
      'init',
      '--json',
      '--bogus-flag',
    ]);

    expect(exitCode).not.toBe(0);
    expect(stderr).toBe('');
    expect(JSON.parse(stdout)).toEqual({
      ok: false,
      command: 'init',
      code: 'unknown_flag',
      message: expect.stringContaining('--bogus-flag'),
    });
  });

  it('emits an unknown_flag envelope at the program level too', async () => {
    const { exitCode, stdout, stderr } = await runCapturing([
      '--json',
      '--bogus-flag',
    ]);

    expect(exitCode).not.toBe(0);
    expect(stderr).toBe('');
    expect(JSON.parse(stdout)).toEqual({
      ok: false,
      command: PROGRAM_NAME,
      code: 'unknown_flag',
      message: expect.stringContaining('--bogus-flag'),
    });
  });

  it('emits a single human-readable error line on stderr without --json', async () => {
    const { exitCode, stdout, stderr } = await runCapturing([
      'init',
      '--bogus-flag',
    ]);

    expect(exitCode).not.toBe(0);
    expect(stdout).toBe('');
    expect(stderr).toContain('--bogus-flag');
    expect(stderr).not.toContain('error: unknown option');
    expect(stderr.trim().split('\n')).toHaveLength(1);
  });
});
