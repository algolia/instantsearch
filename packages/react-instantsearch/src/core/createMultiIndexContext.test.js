/* eslint-env jest, jasmine */
/* eslint-disable no-console */
import React from 'react';
import {shallow} from 'enzyme';

import createMultiIndexContext from './createMultiIndexContext';
import MultiIndexContext from './MultiIndexContext';

describe('createMultiIndexContext', () => {
  const CustomMultiIndexContext = createMultiIndexContext({Root: 'div'});

  it('wraps MultiIndexContext', () => {
    const wrapper = shallow(<CustomMultiIndexContext indexName="name"/>);
    expect(wrapper.is(MultiIndexContext)).toBe(true);
    expect(wrapper.props()).toMatchSnapshot();
  });
});
