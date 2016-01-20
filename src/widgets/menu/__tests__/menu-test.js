/* eslint-env mocha */

import expect from 'expect';
import jsdom from 'jsdom-global';

import menu from '../menu';

describe('menu', () => {
  beforeEach(function() {this.jsdom = jsdom();});
  afterEach(function() {this.jsdom();});

  it('throws an exception when no attributeName', () => {
    const container = document.createElement('div');
    expect(menu.bind(null, {container})).toThrow(/^Usage/);
  });

  it('throws an exception when no container', () => {
    const attributeName = '';
    expect(menu.bind(null, {attributeName})).toThrow(/^Usage/);
  });
});

