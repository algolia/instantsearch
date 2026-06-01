import { runCapturing } from './__utils__/helpers';

describe('add --json', () => {
  it('emits a well-formed success envelope on stdout', async () => {
    const { exitCode, stdout, stderr } = await runCapturing(['add', '--json']);

    expect(exitCode).toBe(0);
    expect(stderr).toBe('');
    expect(JSON.parse(stdout)).toEqual({
      ok: true,
      command: 'add',
      filesCreated: expect.any(Array),
      nextSteps: expect.any(Array),
    });
  });
});
