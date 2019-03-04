import React from 'react';
import { mount } from 'enzyme';
import Panel from '../Panel';

const cssClasses = {
  root: 'root',
  noRefinementRoot: 'noRefinementRoot',
  body: 'body',
  header: 'header',
  footer: 'footer',
};

const getDefaultProps = () => ({
  bodyElement: document.createElement('div'),
  cssClasses,
  hidden: false,
  data: {},
  templateProps: {
    templates: {
      header: 'Header',
      footer: 'Footer',
    },
  },
});

describe('Panel', () => {
  test('should render component with default props', () => {
    const props = {
      ...getDefaultProps(),
    };

    const wrapper = mount(<Panel {...props} />);

    expect(wrapper.find(`.${cssClasses.root}`).exists()).toBe(true);
    expect(wrapper.find(`.${cssClasses.noRefinementRoot}`).exists()).toBe(
      false
    );
    expect(wrapper.find(`.${cssClasses.body}`).exists()).toBe(true);
    expect(wrapper.find(`.${cssClasses.header}`).exists()).toBe(true);
    expect(wrapper.find(`.${cssClasses.footer}`).exists()).toBe(true);
    expect(wrapper.find(`.${cssClasses.header}`).text()).toBe('Header');
    expect(wrapper.find(`.${cssClasses.footer}`).text()).toBe('Footer');
    expect(wrapper).toMatchSnapshot();
  });

  test('should render component with `hidden` prop', () => {
    const props = {
      ...getDefaultProps(),
      hidden: true,
    };

    const wrapper = mount(<Panel {...props} />);

    expect(wrapper.find(`.${cssClasses.root}`).exists()).toBe(true);
    expect(wrapper.find(`.${cssClasses.noRefinementRoot}`).exists()).toBe(true);
    expect(wrapper.find(`.${cssClasses.body}`).exists()).toBe(true);
    expect(wrapper.find(`.${cssClasses.header}`).exists()).toBe(true);
    expect(wrapper.find(`.${cssClasses.footer}`).exists()).toBe(true);
    expect(wrapper.props().hidden).toBe(true);
    expect(wrapper).toMatchSnapshot();
  });
});
