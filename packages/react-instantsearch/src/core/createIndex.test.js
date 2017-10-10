/* eslint-env jest, jasmine */
/* eslint-disable no-console */
import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter() });

import createIndex from './createIndex';
import Index from './Index';

describe('createIndex', () => {
  const CustomIndex = createIndex({ Root: 'div' });

  it('wraps Index', () => {
    const wrapper = shallow(<CustomIndex indexName="name" />);
    expect(wrapper.is(Index)).toBe(true);
    expect(wrapper.props()).toMatchSnapshot();
  });
});
