import { runCapturing } from './__utils__/helpers';

describe.each(['add', 'introspect'])('%s (no --json)', (command) => {
  it('emits human-readable output, not a JSON envelope', async () => {
    const { exitCode, stdout, stderr } = await runCapturing([command]);

    expect(exitCode).toBe(0);
    expect(stderr).toBe('');
    expect(stdout).toContain(command);
    expect(stdout.trimStart().startsWith('{')).toBe(false);
  });
});
