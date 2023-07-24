import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { shallow } from 'enzyme';
import React from 'react';

import QueryRuleCustomData from '../QueryRuleCustomData';

import type { QueryRuleCustomDataProps } from '../QueryRuleCustomData';

Enzyme.configure({ adapter: new Adapter() });

type CustomDataItem = {
  [key: string]: any;
};

type CustomDataProps = QueryRuleCustomDataProps<CustomDataItem>;

describe('QueryRuleCustomData', () => {
  it('expects to render the empty container with empty items', () => {
    const props: CustomDataProps = {
      items: [],
      children: jest.fn(({ items }) =>
        items.map((item) => (
          <section key={item.title}>
            <img src={item.banner} alt={item.title} />
          </section>
        ))
      ),
    };

    const wrapper = shallow(<QueryRuleCustomData {...props} />);

    expect(props.children).toHaveBeenCalledTimes(1);
    expect(props.children).toHaveBeenCalledWith({ items: props.items });
    expect(wrapper).toMatchSnapshot();
  });

  it('expects to render multiple items', () => {
    const props: CustomDataProps = {
      items: [
        { title: 'Image 1', banner: 'image-1.png' },
        { title: 'Image 2', banner: 'image-2.png' },
      ],
      children: jest.fn(({ items }) =>
        items.map((item) => (
          <section key={item.title}>
            <img src={item.banner} alt={item.title} />
          </section>
        ))
      ),
    };

    const wrapper = shallow(<QueryRuleCustomData {...props} />);

    expect(props.children).toHaveBeenCalledTimes(1);
    expect(props.children).toHaveBeenCalledWith({ items: props.items });
    expect(wrapper).toMatchSnapshot();
  });

  it('expects to render with custom className', () => {
    const props: CustomDataProps = {
      items: [],
      className: 'CustomClassName',
      children: jest.fn(() => null),
    };

    const wrapper = shallow(<QueryRuleCustomData {...props} />);

    expect(wrapper.props().className).toContain('CustomClassName');
    expect(wrapper).toMatchSnapshot();
  });
});
