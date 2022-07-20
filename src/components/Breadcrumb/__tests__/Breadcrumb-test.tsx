/**
 * @jest-environment jsdom
 */
/** @jsx h */

import { h } from 'preact';
import { render, fireEvent } from '@testing-library/preact';
import type { BreadcrumbProps } from '../Breadcrumb';
import Breadcrumb from '../Breadcrumb';
import { prepareTemplateProps } from '../../../lib/utils';
import defaultTemplates from '../../../widgets/breadcrumb/defaultTemplates';

const defaultProps: BreadcrumbProps = {
  items: [],
  createURL: (data: string) => data,
  refine: () => {},
  cssClasses: {
    root: 'root',
    noRefinementRoot: 'noRefinementRoot',
    list: 'list',
    item: 'item',
    selectedItem: 'selectedItem',
    link: 'link',
    separator: 'separator',
  },
  templateProps: prepareTemplateProps({
    defaultTemplates,
    templates: {},
    templatesConfig: {},
  }),
};

describe('Breadcrumb', () => {
  describe('Rendering', () => {
    test('renders without items', () => {
      const props = {
        ...defaultProps,
        items: [],
      };

      const { container } = render(<Breadcrumb {...props} />);
      const root = container.querySelector('.root')!;

      expect(root.classList).toContain('noRefinementRoot');
      expect(container).toMatchSnapshot();
    });

    test('renders with a single item', () => {
      const props = {
        ...defaultProps,
        items: [
          {
            value: 'value-0',
            label: 'Label 0',
          },
        ],
      };

      const { container } = render(<Breadcrumb {...props} />);
      const root = container.querySelector('.root')!;

      expect(root.classList).not.toContain('noRefinementRoot');
      expect(container).toMatchSnapshot();
    });

    test('renders with multiple items', () => {
      const props = {
        ...defaultProps,
        items: [
          {
            value: 'value-0',
            label: 'Label 0',
          },
          {
            value: 'value-1',
            label: 'Label 1',
          },
        ],
      };

      const { container } = render(<Breadcrumb {...props} />);
      const root = container.querySelector('.root')!;

      expect(root.classList).not.toContain('noRefinementRoot');
      expect(container).toMatchSnapshot();
    });

    test('renders component with custom `html` templates', () => {
      const { container } = render(
        <Breadcrumb
          {...defaultProps}
          items={[
            {
              value: 'menswear',
              label: 'Menswear',
            },
            {
              value: 'sneakers',
              label: 'Sneakers',
            },
          ]}
          templateProps={{
            ...defaultProps.templateProps,
            templates: {
              home(_, { html }) {
                return html`<span>Home</span>`;
              },
              separator(_, { html }) {
                return html`<span>/</span>`;
              },
            },
          }}
        />
      );

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="root"
  >
    <ul
      class="list"
    >
      <li
        class="item"
      >
        <a
          class="link"
        >
          <span>
            Home
          </span>
        </a>
      </li>
      <li
        class="item"
      >
        <span
          aria-hidden="true"
          class="separator"
        >
          <span>
            /
          </span>
        </span>
        <a
          class="link"
          href="menswear"
        >
          Menswear
        </a>
      </li>
      <li
        class="item selectedItem"
      >
        <span
          aria-hidden="true"
          class="separator"
        >
          <span>
            /
          </span>
        </span>
        Sneakers
      </li>
    </ul>
  </div>
</div>
`);
    });
  });

  describe('Events', () => {
    test('calls `refine` with the correct values', () => {
      const refine = jest.fn();
      const props = {
        ...defaultProps,
        refine,
        items: [
          {
            value: 'value-0',
            label: 'Label 0',
          },
          {
            value: 'value-1',
            label: 'Label 1',
          },
        ],
      };

      const { container } = render(<Breadcrumb {...props} />);
      const [firstLink, secondLink] = container.querySelectorAll('.link');

      fireEvent.click(secondLink);

      expect(refine).toHaveBeenCalledTimes(1);
      expect(refine).toHaveBeenCalledWith('value-0');

      fireEvent.click(firstLink);

      expect(refine).toHaveBeenCalledTimes(2);
      expect(refine).toHaveBeenCalledWith(undefined);
    });
  });
});
