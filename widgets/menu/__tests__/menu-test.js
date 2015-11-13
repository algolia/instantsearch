/* eslint-env mocha */

import expect from 'expect';
import jsdom from 'mocha-jsdom';

import menu from '../menu';

describe('indexSelector call', () => {
  jsdom({useEach: true});

  it('throws an exception when no attributeName', () => {
    const container = document.createElement('div');
    expect(menu.bind(null, {container})).toThrow(/^Usage/);
  });

  it('throws an exception when no container', () => {
    const attributeName = '';
    expect(menu.bind(null, {attributeName})).toThrow(/^Usage/);
  });
});

