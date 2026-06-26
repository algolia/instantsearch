import semver from 'semver';

import version from '../src/version';

import { runCapturing } from './__utils__/helpers';

describe('version', () => {
  it('is a valid semver string', () => {
    expect(semver.valid(version)).not.toBeNull();
  });

  it('--version prints it', async () => {
    const { stdout, stderr } = await runCapturing(['--version']);

    expect(stdout).toContain(version);
    expect(stderr).toBe('');
  });
});
