import React from 'react';
import { mount } from 'enzyme';
import Selector from '../Selector';

describe('Selector', () => {
  it('should render <Selector /> with strings', () => {
    const props = {
      currentValue: 'index-a',
      setValue: () => {},
      cssClasses: {
        root: 'custom-root',
        select: 'custom-select',
        option: 'custom-option',
      },
      options: [
        { value: 'index-a', label: 'Index A' },
        { value: 'index-b', label: 'Index B' },
      ],
    };
    const wrapper = mount(<Selector {...props} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('should render <Selector /> with numbers', () => {
    const props = {
      currentValue: 10,
      setValue: () => {},
      cssClasses: {
        root: 'custom-root',
        select: 'custom-select',
        option: 'custom-option',
      },
      options: [
        { value: 10, label: '10 results per page' },
        { value: 20, label: '20 results per page' },
      ],
    };
    const wrapper = mount(<Selector {...props} />);

    expect(wrapper).toMatchSnapshot();
  });
});
