/* eslint-env mocha */

import expect from 'expect';
import version from '../version';

describe('version', () => {
  it('includes the latest version', () => {
    let pkg = require('../../package.json');
    expect(version).toEqual(pkg.version);
  });
});
