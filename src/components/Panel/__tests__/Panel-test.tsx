/** @jsx h */

import { h } from 'preact';
import { render, fireEvent } from '@testing-library/preact';
import Panel from '../Panel';
import { createRenderOptions } from '../../../../test/mock/createWidget';

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
  isCollapsed: false,
  data: createRenderOptions(),
  templates: {
    header: '',
    footer: '',
    collapseButtonText: '',
  },
});

describe('Panel', () => {
  describe('default', () => {
    test('should render component with default props', () => {
      const props = {
        ...getDefaultProps(),
      };

      const { container } = render(<Panel {...props} />);

      expect(
        container.querySelector(`.${cssClasses.root}`)
      ).toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.noRefinementRoot}`)
      ).not.toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.collapsibleRoot}`)
      ).not.toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.collapsedRoot}`)
      ).not.toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.collapseButton}`)
      ).not.toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.body}`)
      ).toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.header}`)
      ).not.toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.footer}`)
      ).not.toBeInTheDocument();

      expect(container).toMatchSnapshot();
    });
  });

  describe('templates', () => {
    test('should render component with custom templates', () => {
      const props = {
        ...getDefaultProps(),
        templates: {
          header: 'Header',
          footer: 'Footer',
          collapseButtonText: 'Toggle',
        },
      };

      const { container } = render(<Panel {...props} />);

      expect(
        container.querySelector(`.${cssClasses.root}`)
      ).toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.noRefinementRoot}`)
      ).not.toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.collapsibleRoot}`)
      ).not.toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.collapsedRoot}`)
      ).not.toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.collapseButton}`)
      ).not.toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.body}`)
      ).toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.header}`)
      ).toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.footer}`)
      ).toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.header} span`)
      ).toHaveTextContent('Header');
      expect(
        container.querySelector(`.${cssClasses.footer}`)
      ).toHaveTextContent('Footer');

      expect(container).toMatchSnapshot();
    });
  });

  describe('hidden', () => {
    test('should hide component with `hidden` prop', () => {
      const props = {
        ...getDefaultProps(),
        hidden: true,
        templates: {
          header: 'Header',
          footer: 'Footer',
          collapseButtonText: 'Toggle',
        },
      };

      const { container } = render(<Panel {...props} />);

      expect(
        container.querySelector(`.${cssClasses.root}`)
      ).toBeInTheDocument();
      expect(container.querySelector(`.${cssClasses.root}`)).not.toBeVisible();
      expect(
        container.querySelector(`.${cssClasses.noRefinementRoot}`)
      ).toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.collapsibleRoot}`)
      ).not.toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.collapsedRoot}`)
      ).not.toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.collapseButton}`)
      ).not.toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.body}`)
      ).toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.header}`)
      ).toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.footer}`)
      ).toBeInTheDocument();

      expect(container).toMatchSnapshot();
    });
  });

  describe('collapsible', () => {
    test('should render component with `collapsible` prop', () => {
      const props = {
        ...getDefaultProps(),
        templates: {
          header: 'Header',
          footer: 'Footer',
          collapseButtonText: ({ collapsed }) => (collapsed ? 'More' : 'Less'),
        },
        collapsible: true,
      };

      const { container } = render(<Panel {...props} />);

      expect(
        container.querySelector(`.${cssClasses.root}`)
      ).toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.collapsibleRoot}`)
      ).toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.collapsedRoot}`)
      ).not.toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.collapseButton}`)
      ).toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.collapseButton}`)
      ).toHaveTextContent('Less');
      expect(
        container.querySelector(`.${cssClasses.collapseButton}`)
      ).toHaveAttribute('aria-expanded', 'true');
      expect(
        container.querySelector(`.${cssClasses.body}`)
      ).toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.header}`)
      ).toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.footer}`)
      ).toBeInTheDocument();

      expect(container).toMatchSnapshot();
    });

    test('should render component with `collapsible` and `collapsed` props', () => {
      const props = {
        ...getDefaultProps(),
        collapsible: true,
        isCollapsed: true,
        templates: {
          header: 'Header',
          footer: 'Footer',
          collapseButtonText: ({ collapsed }) => (collapsed ? 'More' : 'Less'),
        },
      };

      const { container } = render(<Panel {...props} />);

      expect(
        container.querySelector(`.${cssClasses.root}`)
      ).toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.collapsibleRoot}`)
      ).toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.collapsedRoot}`)
      ).toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.collapseButton}`)
      ).toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.collapseButton}`)
      ).toHaveTextContent('More');
      expect(
        container.querySelector(`.${cssClasses.collapseButton}`)
      ).not.toHaveAttribute('aria-expanded');
      expect(
        container.querySelector(`.${cssClasses.body}`)
      ).toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.header}`)
      ).toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.footer}`)
      ).toBeInTheDocument();

      expect(container).toMatchSnapshot();
    });

    test('should collapse on button click', () => {
      const props = {
        ...getDefaultProps(),
        collapsible: true,
        isCollapsed: false,
        templates: {
          header: 'Header',
          footer: 'Footer',
          collapseButtonText: ({ collapsed }) => (collapsed ? 'More' : 'Less'),
        },
      };

      const { container } = render(<Panel {...props} />);
      const collapseButton = container.querySelector<HTMLElement>(
        `.${cssClasses.collapseButton}`
      )!;

      // Default state
      expect(
        container.querySelector(`.${cssClasses.collapsedRoot}`)
      ).not.toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.collapseButton}`)
      ).toHaveTextContent('Less');
      expect(
        container.querySelector(`.${cssClasses.collapseButton}`)
      ).toHaveAttribute('aria-expanded', 'true');

      // Collapse the panel
      fireEvent.click(collapseButton);

      // Collapsed state
      expect(
        container.querySelector(`.${cssClasses.collapsedRoot}`)
      ).toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.collapseButton}`)
      ).toHaveTextContent('More');
      expect(
        container.querySelector(`.${cssClasses.collapseButton}`)
      ).not.toHaveAttribute('aria-expanded');

      // Un-collapse the panel
      fireEvent.click(collapseButton);

      // Back to default state
      expect(
        container.querySelector(`.${cssClasses.collapsedRoot}`)
      ).not.toBeInTheDocument();
      expect(
        container.querySelector(`.${cssClasses.collapseButton}`)
      ).toHaveTextContent('Less');
      expect(
        container.querySelector(`.${cssClasses.collapseButton}`)
      ).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
