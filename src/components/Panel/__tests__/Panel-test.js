import React from 'react';
import { mount } from 'enzyme';
import Panel from '../Panel';

describe('Panel', () => {
  test('should render component with default props', () => {
    const props = {
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

    expect(wrapper.find('.root')).toHaveLength(1);
    expect(wrapper.find('.noRefinementRoot')).toHaveLength(0);
    expect(wrapper.find('.body')).toHaveLength(1);
    expect(wrapper.find('.header')).toHaveLength(1);
    expect(wrapper.find('.footer')).toHaveLength(1);
    expect(wrapper.find('.header').text()).toBe('Header');
    expect(wrapper.find('.footer').text()).toBe('Footer');
    expect(wrapper).toMatchSnapshot();
  });

  test('should render component with `hidden` prop', () => {
    const props = {
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

    expect(wrapper.find('.root')).toHaveLength(1);
    expect(wrapper.find('.noRefinementRoot')).toHaveLength(1);
    expect(wrapper.find('.body')).toHaveLength(1);
    expect(wrapper.find('.header')).toHaveLength(1);
    expect(wrapper.find('.footer')).toHaveLength(1);
    expect(wrapper.props().hidden).toBe(true);
    expect(wrapper).toMatchSnapshot();
  });
});
