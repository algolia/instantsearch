import { runCapturing } from './__utils__/helpers';

describe.each(['add', 'introspect'])('%s --json', (command) => {
  it('emits a well-formed success envelope on stdout', async () => {
    const { exitCode, stdout, stderr } = await runCapturing([
      command,
      '--json',
    ]);

    expect(exitCode).toBe(0);
    expect(stderr).toBe('');
    expect(JSON.parse(stdout)).toEqual({
      ok: true,
      command,
      filesCreated: expect.any(Array),
      nextSteps: expect.any(Array),
    });
  });
});
