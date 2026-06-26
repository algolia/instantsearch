import { readFileSync } from 'fs';
import { join } from 'path';

const packageJson = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf8')
);

describe('package metadata', () => {
  it('is named @instantsearch/cli', () => {
    expect(packageJson.name).toBe('@instantsearch/cli');
  });

  it('exposes an instantsearch bin', () => {
    expect(packageJson.bin).toHaveProperty('instantsearch');
  });
});
