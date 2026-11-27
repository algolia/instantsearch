import { runCapturing } from './__utils__/helpers';

describe('invalid flag value', () => {
  it('emits an invalid_flag envelope when --framework gets an unsupported value', async () => {
    const { exitCode, stdout, stderr } = await runCapturing([
      'init',
      '--framework',
      'bogus',
      '--json',
    ]);

    expect(exitCode).not.toBe(0);
    expect(stderr).toBe('');
    expect(JSON.parse(stdout)).toMatchObject({
      ok: false,
      code: 'invalid_flag',
      message: expect.stringContaining('bogus'),
    });
  });
});
