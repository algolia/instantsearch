import React from 'react';
import { mount } from 'enzyme';
import Panel from '../Panel';

describe('Panel', () => {
  test('should render component with default props', () => {
    const props = {
      bodyElement: document.createElement('div'),
      cssClasses: {
        root: 'root',
        noRefinementRoot: 'noRefinementRoot',
        body: 'body',
        header: 'header',
        footer: 'footer',
      },
      hidden: false,
      data: {},
      templateProps: {
        templates: {
          header: 'Header',
          footer: 'Footer',
        },
      },
    };

    const wrapper = mount(<Panel {...props} />);

    expect(wrapper.find('.root').exists()).toBe(true);
    expect(wrapper.find('.noRefinementRoot').exists()).toBe(false);
    expect(wrapper.find('.body').exists()).toBe(true);
    expect(wrapper.find('.header').exists()).toBe(true);
    expect(wrapper.find('.footer').exists()).toBe(true);
    expect(wrapper.find('.header').text()).toBe('Header');
    expect(wrapper.find('.footer').text()).toBe('Footer');
    expect(wrapper).toMatchSnapshot();
  });

  test('should render component with `hidden` prop', () => {
    const props = {
      bodyElement: document.createElement('div'),
      cssClasses: {
        root: 'root',
        noRefinementRoot: 'noRefinementRoot',
        body: 'body',
        header: 'header',
        footer: 'footer',
      },
      hidden: true,
      data: {},
      templateProps: {
        templates: {
          header: 'Header',
          footer: 'Footer',
        },
      },
    };

    const wrapper = mount(<Panel {...props} />);

    expect(wrapper.find('.root').exists()).toBe(true);
    expect(wrapper.find('.noRefinementRoot').exists()).toBe(true);
    expect(wrapper.find('.body').exists()).toBe(true);
    expect(wrapper.find('.header').exists()).toBe(true);
    expect(wrapper.find('.footer').exists()).toBe(true);
    expect(wrapper.props().hidden).toBe(true);
    expect(wrapper).toMatchSnapshot();
  });
});
