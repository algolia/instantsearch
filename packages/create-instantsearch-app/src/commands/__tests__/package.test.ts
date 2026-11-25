import { readFileSync } from 'fs';
import { join } from 'path';

const packageJson = JSON.parse(
  readFileSync(join(__dirname, '..', '..', '..', 'package.json'), 'utf8')
);

describe('package metadata', () => {
  it('publishes the built commands', () => {
    expect(packageJson.files).toContain('dist');
  });

  it('builds the commands before publishing', () => {
    expect(packageJson.scripts.build).toMatch(/build-commands/);
  });
});
