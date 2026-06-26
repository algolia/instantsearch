import path from 'path';

import { runCapturing } from './__utils__/helpers';

const FIXTURES_ROOT = path.join(__dirname, 'fixtures', 'detector');

describe('init exit code', () => {
  it('returns a non-zero process exit code when runInit fails', async () => {
    const originalCwd = process.cwd();
    process.chdir(path.join(FIXTURES_ROOT, 'vanilla'));
    try {
      const { exitCode } = await runCapturing([
        'init',
        '--json',
        '--app-id',
        'X',
        '--search-api-key',
        'Y',
      ]);

      expect(exitCode).not.toBe(0);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('surfaces the human-mode failure message on stderr', async () => {
    const originalCwd = process.cwd();
    process.chdir(path.join(FIXTURES_ROOT, 'vanilla'));
    try {
      const { exitCode, stdout, stderr } = await runCapturing([
        'init',
        '--yes',
        '--app-id',
        'X',
        '--search-api-key',
        'Y',
      ]);

      expect(exitCode).not.toBe(0);
      expect(stdout).toBe('');
      expect(stderr).toMatch(/react/i);
    } finally {
      process.chdir(originalCwd);
    }
  });
});
