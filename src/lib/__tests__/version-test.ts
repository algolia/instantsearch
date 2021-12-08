import version from '../version.js';

describe('version', () => {
  it('includes the latest version', () => {
    expect(version).toMatch(/^(\d+\.)?(\d+\.)?(\*|\d+)(-beta.\d+)?$/);
  });
});
