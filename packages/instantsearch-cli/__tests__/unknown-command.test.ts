import { PROGRAM_NAME } from '../src/program';

import { runCapturing } from './__utils__/helpers';

describe('unknown command', () => {
  it('emits an unknown_command failure envelope when --json is set', async () => {
    const { exitCode, stdout, stderr } = await runCapturing([
      'bogus-command',
      '--json',
    ]);

    expect(exitCode).not.toBe(0);
    expect(stderr).toBe('');
    expect(JSON.parse(stdout)).toEqual({
      ok: false,
      command: PROGRAM_NAME,
      code: 'unknown_command',
      message: expect.stringContaining('bogus-command'),
    });
  });

  it('emits a single human-readable error line on stderr without --json', async () => {
    const { exitCode, stdout, stderr } = await runCapturing(['bogus-command']);

    expect(exitCode).not.toBe(0);
    expect(stdout).toBe('');
    expect(stderr).toContain('bogus-command');
    expect(stderr).not.toMatch(/^error:/i);
    expect(stderr.trim().split('\n')).toHaveLength(1);
  });

  it('keeps the envelope message single-line even for inputs Commander would suggest a match for', async () => {
    const { stdout } = await runCapturing(['introspct', '--json']);

    const envelope = JSON.parse(stdout);
    expect(envelope.code).toBe('unknown_command');
    expect(envelope.message).not.toMatch(/Did you mean/i);
    expect(envelope.message.split('\n')).toHaveLength(1);
  });
});
