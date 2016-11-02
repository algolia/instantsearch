/* eslint-env jest, jasmine */

// @TODO re-include this test in the normal .test.js
// when React 15.4 is out: https://github.com/facebook/react/issues/7386

import React from 'react';
import {mount} from 'enzyme';

import Pagination from './Pagination';

const REQ_PROPS = {
  createURL: () => '#',
  refine: () => null,
};

const DEFAULT_PROPS = {
  ...REQ_PROPS,
  nbPages: 20,
  currentRefinement: 9,
};

describe('Pagination', () => {
  it('refines its value when clicking on a page link', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <Pagination
        {...DEFAULT_PROPS}
        refine={refine}
        showLast
      />
    );
    wrapper
      .find('.itemLink')
      .filterWhere(e => e.text() === '8')
      .simulate('click');
    expect(refine.mock.calls.length).toBe(1);
    expect(refine.mock.calls[0][0]).toEqual(8);
    wrapper
      .find('.itemLink')
      .filterWhere(e => e.text() === '9')
      .simulate('click');
    expect(refine.mock.calls.length).toBe(2);
    const parameters = refine.mock.calls[1][0];
    expect(parameters.valueOf()).toBe(9);
    expect(parameters.isSamePage).toBe(true);
    wrapper
      .find('.itemPrevious')
      .find('.itemLink')
      .simulate('click');
    expect(refine.mock.calls.length).toBe(3);
    expect(refine.mock.calls[2][0]).toEqual(8);
    wrapper
      .find('.itemNext')
      .find('.itemLink')
      .simulate('click');
    expect(refine.mock.calls.length).toBe(4);
    expect(refine.mock.calls[3][0]).toEqual(10);
    wrapper
      .find('.itemFirst')
      .find('.itemLink')
      .simulate('click');
    expect(refine.mock.calls.length).toBe(5);
    expect(refine.mock.calls[4][0]).toEqual(1);
    wrapper
      .find('.itemLast')
      .find('.itemLink')
      .simulate('click');
    expect(refine.mock.calls.length).toBe(6);
    expect(refine.mock.calls[5][0]).toEqual(20);
  });

  it('ignores special clicks', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <Pagination
        {...DEFAULT_PROPS}
        refine={refine}
      />
    );
    const el = wrapper
      .find('.itemLink')
      .filterWhere(e => e.text() === '8');
    el.simulate('click', {button: 1});
    el.simulate('click', {altKey: true});
    el.simulate('click', {ctrlKey: true});
    el.simulate('click', {metaKey: true});
    el.simulate('click', {shiftKey: true});
    expect(refine.mock.calls.length).toBe(0);
  });
});
