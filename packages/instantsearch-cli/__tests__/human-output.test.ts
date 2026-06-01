import { runCapturing } from './__utils__/helpers';

describe('add (no --json)', () => {
  it('emits human-readable output, not a JSON envelope', async () => {
    const { exitCode, stdout, stderr } = await runCapturing(['add']);

    expect(exitCode).toBe(0);
    expect(stderr).toBe('');
    expect(stdout).toContain('add');
    expect(stdout.trimStart().startsWith('{')).toBe(false);
  });
});
