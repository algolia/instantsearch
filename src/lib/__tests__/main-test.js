/* eslint-env mocha */

import expect from 'expect';

import instantsearch from '../main.js';
import forEach from 'lodash/collection/forEach';

describe('instantsearch()', () => {
   // to ensure the global.window is set

  it('includes a version', () => {
    expect(instantsearch.version).toBeA('string');
  });

  it('statically creates a URL', () => {
    expect(instantsearch.createQueryString({hitsPerPage: 42})).toEqual('hPP=42');
  });

  it('statically creates a complex URL', () => {
    expect(instantsearch.createQueryString({hitsPerPage: 42, facetsRefinements: {category: 'Home'}}))
      .toEqual('hPP=42&fR[category]=Home');
  });

  it('includes the widget functions', () => {
    forEach(instantsearch.widgets, widget => {
      expect(typeof widget).toEqual('function', 'A widget must be a function');
    });
  });
});
