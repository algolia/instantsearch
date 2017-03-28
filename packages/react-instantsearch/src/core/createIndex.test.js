/* eslint-env jest, jasmine */
/* eslint-disable no-console */
import React from 'react';
import {shallow} from 'enzyme';

import createIndex from './createIndex';
import Index from './Index';

describe('createIndex', () => {
  const CustomIndex = createIndex({Root: 'div'});

  it('wraps Index', () => {
    const wrapper = shallow(<CustomIndex indexName="name"/>);
    expect(wrapper.is(Index)).toBe(true);
    expect(wrapper.props()).toMatchSnapshot();
  });
});
