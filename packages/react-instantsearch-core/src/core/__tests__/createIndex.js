import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Index from '../../components/Index';
import createIndex from '../createIndex';

Enzyme.configure({ adapter: new Adapter() });

describe('createIndex', () => {
  const CustomIndex = createIndex({ Root: 'div' });

  it('wraps Index', () => {
    const wrapper = shallow(<CustomIndex indexName="name" />);
    expect(wrapper.is(Index)).toBe(true);
    expect(wrapper).toMatchSnapshot();
  });

  it('expect to create Index with a custom root props', () => {
    const root = {
      Root: 'span',
      props: {
        style: {
          flex: 1,
        },
      },
    };

    const wrapper = shallow(<CustomIndex indexName="name" root={root} />);

    expect(wrapper.is(Index)).toBe(true);
    expect(wrapper.props().root).toEqual(root);
    expect(wrapper).toMatchSnapshot();
  });
});
