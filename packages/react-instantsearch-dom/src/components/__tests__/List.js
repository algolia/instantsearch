import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { shallow } from 'enzyme';
import React from 'react';

import List from '../List';

Enzyme.configure({ adapter: new Adapter() });

describe('List', () => {
  const defaultProps = {
    items: [],
    canRefine: true,
    renderItem: (item) => <span>{item.value}</span>,
    cx: (...args) => args.filter(Boolean).join(' '),
  };

  const apple = {
    label: 'Apple',
    value: 'Apple',
    count: 100,
    isRefined: false,
  };

  const appleSubElements = [
    {
      label: 'iPhone',
      value: 'iPhone',
      count: 50,
      isRefined: false,
    },
    {
      label: 'iPad',
      value: 'iPad',
      count: 50,
      isRefined: false,
    },
  ];

  const samsung = {
    label: 'Samsung',
    value: 'Samsung',
    count: 50,
    isRefined: false,
  };

  const samsungSubElements = [
    {
      label: 'S8',
      value: 'S8',
      count: 25,
      isRefined: false,
    },
    {
      label: 'Note 5',
      value: 'Note 5',
      count: 25,
      isRefined: false,
    },
  ];

  const microsoft = {
    label: 'Microsoft',
    value: 'Microsoft',
    count: 25,
    isRefined: false,
  };

  const microsoftSubElements = [
    {
      label: 'Surface',
      value: 'Surface',
      count: 13,
      isRefined: false,
    },
    {
      label: 'Surface Pro',
      value: 'Surface Pro',
      count: 12,
      isRefined: false,
    },
  ];

  it('expect to render a list of items', () => {
    const props = {
      ...defaultProps,
      items: [apple, samsung, microsoft],
    };

    const wrapper = shallow(<List {...props} />);

    expect(wrapper.find('.item')).toHaveLength(3);

    expect(wrapper).toMatchSnapshot();
  });

  it('expect to render a list of nested items', () => {
    const props = {
      ...defaultProps,
      items: [
        {
          ...apple,
          items: appleSubElements,
        },
        {
          ...samsung,
          items: samsungSubElements,
        },
        {
          ...microsoft,
          items: microsoftSubElements,
        },
      ],
    };

    const wrapper = shallow(<List {...props} />);

    expect(wrapper.find('.item')).toHaveLength(9); // 3 parents + (3 * 2 children)
    expect(wrapper.find('.item--parent')).toHaveLength(3);
    expect(wrapper.find('.list--child')).toHaveLength(3);

    expect(wrapper).toMatchSnapshot();
  });

  it('expect to render a list of nested items with empty children', () => {
    const props = {
      ...defaultProps,
      items: [
        {
          ...apple,
          items: appleSubElements,
        },
        {
          ...samsung,
          items: samsungSubElements,
        },
        microsoft,
      ],
    };

    const wrapper = shallow(<List {...props} />);

    expect(wrapper.find('.item')).toHaveLength(7); // 3 parents + (2 * 2 children)
    expect(wrapper.find('.item--parent')).toHaveLength(2);
    expect(wrapper.find('.list--child')).toHaveLength(2);

    expect(wrapper).toMatchSnapshot();
  });
});
