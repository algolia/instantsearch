/* eslint-env mocha */

import expect from 'expect';

import refinementSelect from '../refinement-select.js';

describe('refinement-select', () => {
  it('throws an exception when no attributeName', () => {
    const container = document.createElement('div');
    expect(refinementSelect.bind(null, {container})).toThrow(/^Usage/);
  });

  it('throws an exception when no container', () => {
    const attributeName = 'foo';
    expect(refinementSelect.bind(null, {attributeName})).toThrow(/^Usage/);
  });

  it('throws an exception when `templates.seeAllOption` is not a string', () => {
    const container = document.createElement('div');
    const attributeName = 'foo';
    const templates = {seeAllOption() {}};
    expect(refinementSelect.bind(null, {container, attributeName, templates})).toThrow(/^Usage/);
  });

  it('throws an exception when `templates.selectOption` is not a function', () => {
    const container = document.createElement('div');
    const attributeName = 'foo';
    const templates = {selectOption: 'bar'};
    expect(refinementSelect.bind(null, {container, attributeName, templates})).toThrow(/^Usage/);
  });

  it('doesnt throws when params are 👌', () => {
    const container = document.createElement('div');
    const attributeName = 'foo';
    expect(refinementSelect.bind(null, {container, attributeName})).toNotThrow(/^Usage/);
  });
});
