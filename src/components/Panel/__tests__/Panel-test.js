import React from 'react';
import { mount } from 'enzyme';
import Panel from '../Panel';

const cssClasses = {
  root: 'root',
  noRefinementRoot: 'noRefinementRoot',
  collapsibleRoot: 'collapsibleRoot',
  collapsedRoot: 'collapsedRoot',
  collapseButton: 'collapseButton',
  body: 'body',
  header: 'header',
  footer: 'footer',
};

const getDefaultProps = () => ({
  bodyElement: document.createElement('div'),
  cssClasses,
  hidden: false,
  collapsible: false,
  collapsed: false,
  data: {},
  templateProps: {
    templates: {
      header: 'Header',
      footer: 'Footer',
      collapseButtonMore: 'More',
      collapseButtonLess: 'Less',
    },
  },
});

describe('Panel', () => {
  describe('default', () => {
    test('should render component with default props', () => {
      const props = {
        ...getDefaultProps(),
      };

      const wrapper = mount(<Panel {...props} />);

      expect(wrapper.find(`.${cssClasses.root}`).exists()).toBe(true);
      expect(wrapper.find(`.${cssClasses.noRefinementRoot}`).exists()).toBe(
        false
      );
      expect(wrapper.find(`.${cssClasses.collapsibleRoot}`).exists()).toBe(
        false
      );
      expect(wrapper.find(`.${cssClasses.collapsedRoot}`).exists()).toBe(false);
      expect(wrapper.find(`.${cssClasses.collapseButton}`).exists()).toBe(
        false
      );
      expect(wrapper.find(`.${cssClasses.body}`).exists()).toBe(true);
      expect(wrapper.find(`.${cssClasses.header}`).exists()).toBe(true);
      expect(wrapper.find(`.${cssClasses.footer}`).exists()).toBe(true);
      expect(wrapper.find(`.${cssClasses.header}`).text()).toBe('Header');
      expect(wrapper.find(`.${cssClasses.footer}`).text()).toBe('Footer');

      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('hidden', () => {
    test('should render component with `hidden` prop', () => {
      const props = {
        ...getDefaultProps(),
        hidden: true,
      };

      const wrapper = mount(<Panel {...props} />);

      expect(wrapper.find(`.${cssClasses.root}`).exists()).toBe(true);
      expect(wrapper.find(`.${cssClasses.noRefinementRoot}`).exists()).toBe(
        true
      );
      expect(wrapper.find(`.${cssClasses.collapsibleRoot}`).exists()).toBe(
        false
      );
      expect(wrapper.find(`.${cssClasses.collapsedRoot}`).exists()).toBe(false);
      expect(wrapper.find(`.${cssClasses.collapseButton}`).exists()).toBe(
        false
      );
      expect(wrapper.find(`.${cssClasses.body}`).exists()).toBe(true);
      expect(wrapper.find(`.${cssClasses.header}`).exists()).toBe(true);
      expect(wrapper.find(`.${cssClasses.footer}`).exists()).toBe(true);
      expect(wrapper.props().hidden).toBe(true);

      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('collapsible', () => {
    test('should render component with `collapsible` prop', () => {
      const props = {
        ...getDefaultProps(),
        collapsible: true,
      };

      const wrapper = mount(<Panel {...props} />);

      expect(wrapper.find(`.${cssClasses.root}`).exists()).toBe(true);
      expect(wrapper.find(`.${cssClasses.collapsibleRoot}`).exists()).toBe(
        true
      );
      expect(wrapper.find(`.${cssClasses.collapsedRoot}`).exists()).toBe(false);
      expect(wrapper.find(`.${cssClasses.collapseButton}`).exists()).toBe(true);
      expect(wrapper.find(`.${cssClasses.collapseButton}`).text()).toBe('Less');
      expect(
        wrapper.find(`.${cssClasses.collapseButton}`).prop('aria-expanded')
      ).toBe(true);
      expect(wrapper.find(`.${cssClasses.body}`).exists()).toBe(true);
      expect(wrapper.find(`.${cssClasses.header}`).exists()).toBe(true);
      expect(wrapper.find(`.${cssClasses.footer}`).exists()).toBe(true);

      expect(wrapper).toMatchSnapshot();
    });

    test('should render component with `collapsible` and `collapsed` props', () => {
      const props = {
        ...getDefaultProps(),
        collapsible: true,
        collapsed: true,
      };

      const wrapper = mount(<Panel {...props} />);

      expect(wrapper.find(`.${cssClasses.root}`).exists()).toBe(true);
      expect(wrapper.find(`.${cssClasses.collapsibleRoot}`).exists()).toBe(
        true
      );
      expect(wrapper.find(`.${cssClasses.collapsedRoot}`).exists()).toBe(true);
      expect(wrapper.find(`.${cssClasses.collapseButton}`).exists()).toBe(true);
      expect(wrapper.find(`.${cssClasses.collapseButton}`).text()).toBe('More');
      expect(
        wrapper.find(`.${cssClasses.collapseButton}`).prop('aria-expanded')
      ).toBe(false);
      expect(wrapper.find(`.${cssClasses.body}`).exists()).toBe(true);
      expect(wrapper.find(`.${cssClasses.header}`).exists()).toBe(true);
      expect(wrapper.find(`.${cssClasses.footer}`).exists()).toBe(true);

      expect(wrapper).toMatchSnapshot();
    });

    test('should collapse on button click', () => {
      const props = {
        ...getDefaultProps(),
        collapsible: true,
        collapsed: false,
      };

      const wrapper = mount(<Panel {...props} />);
      const collapseButton = wrapper.find(`.${cssClasses.collapseButton}`);

      // Default state
      expect(wrapper.find(`.${cssClasses.collapsedRoot}`).exists()).toBe(false);
      expect(wrapper.find(`.${cssClasses.collapseButton}`).text()).toBe('Less');
      expect(
        wrapper.find(`.${cssClasses.collapseButton}`).prop('aria-expanded')
      ).toBe(true);

      // Collapse the panel
      collapseButton.simulate('click');

      // Collapsed state
      expect(wrapper.find(`.${cssClasses.collapsedRoot}`).exists()).toBe(true);
      expect(wrapper.find(`.${cssClasses.collapseButton}`).text()).toBe('More');
      expect(
        wrapper.find(`.${cssClasses.collapseButton}`).prop('aria-expanded')
      ).toBe(false);

      // Un-collapse the panel
      collapseButton.simulate('click');

      // Back to default state
      expect(wrapper.find(`.${cssClasses.collapsedRoot}`).exists()).toBe(false);
      expect(wrapper.find(`.${cssClasses.collapseButton}`).text()).toBe('Less');
      expect(
        wrapper.find(`.${cssClasses.collapseButton}`).prop('aria-expanded')
      ).toBe(true);
    });
  });
});
