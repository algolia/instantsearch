/* eslint-env mocha */

import expect from 'expect';
import jsdom from 'mocha-jsdom';

import menu from '../menu';

describe('indexSelector call', () => {
  jsdom({useEach: true});

  it('throws an exception when no facetName', () => {
    const container = document.createElement('div');
    expect(menu.bind(null, {container})).toThrow(/^Usage/);
  });

  it('throws an exception when no container', () => {
    const facetName = '';
    expect(menu.bind(null, {facetName})).toThrow(/^Usage/);
  });
});

