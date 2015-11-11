/* eslint-env mocha */

import expect from 'expect';
import jsdom from 'mocha-jsdom';

describe('hierarchicalMenu call', () => {
  jsdom({useEach: true});
  const hierarchicalMenu = require('../hierarchical-menu');

  it('throws an exception when no attributeName', () => {
    const container = document.createElement('div');
    expect(hierarchicalMenu.bind(null, {container})).toThrow(/^Usage:/);
  });

  it('throws an exception when no container', () => {
    const attributeName = 'myAttribute';
    expect(hierarchicalMenu.bind(null, {attributeName})).toThrow(/Usage:/);
  });
});
