/* eslint-env mocha */

import expect from 'expect';
import jsdom from 'mocha-jsdom';

describe('instantsearch()', () => {
  jsdom({useEach: true}); // to ensure the global.window is set

  var instantsearch;

  beforeEach(() => {
    // depends on global.window/navigator
    instantsearch = require('../main.js');
  });

  it('includes the latest version', () => {
    var pkg = require('../../package.json');
    expect(instantsearch.version).toEqual(pkg.version);
  });

  it('includes the widget functions', () => {
    var forEach = require('lodash/collection/forEach');
    forEach(instantsearch.widgets, function(widget) {
      expect(typeof widget).toEqual('function', 'A widget must be a function');
    });
  });
});
