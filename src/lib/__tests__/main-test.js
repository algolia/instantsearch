/* eslint-env mocha */

import expect from 'expect';
import jsdom from 'mocha-jsdom';

describe('instantsearch()', () => {
  jsdom({useEach: true}); // to ensure the global.window is set

  let instantsearch;

  beforeEach(() => {
    // depends on global.window/navigator
    instantsearch = require('../main.js');
  });

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
    let forEach = require('lodash/collection/forEach');
    forEach(instantsearch.widgets, function(widget) {
      expect(typeof widget).toEqual('function', 'A widget must be a function');
    });
  });
});
