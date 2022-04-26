import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { Menu } from '../Menu';

import type { MenuProps } from '../Menu';

describe('Menu', () => {
  function createProps(props: Partial<MenuProps>): MenuProps {
    return {
      items: [
        {
          value: 'Insignia™',
          label: 'Insignia™',
          count: 746,
          isRefined: true,
        },
        {
          value: 'Samsung',
          label: 'Samsung',
          count: 633,
          isRefined: false,
        },
      ],
      onRefine: jest.fn(),
      createURL: (value) => `#${value}`,
      onToggleShowMore: jest.fn(),
      canToggleShowMore: true,
      isShowingMore: false,
      ...props,
    };
  }

  test('renders with items', () => {
    const props = createProps({});
    const { container } = render(<Menu {...props} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Menu"
        >
          <ul
            class="ais-Menu-list"
          >
            <li
              class="ais-Menu-item ais-Menu-item--selected"
            >
              <a
                class="ais-Menu-link"
                href="#Insignia™"
              >
                <span
                  class="ais-Menu-label"
                >
                  Insignia™
                </span>
                <span
                  class="ais-Menu-count"
                >
                  746
                </span>
              </a>
            </li>
            <li
              class="ais-Menu-item"
            >
              <a
                class="ais-Menu-link"
                href="#Samsung"
              >
                <span
                  class="ais-Menu-label"
                >
                  Samsung
                </span>
                <span
                  class="ais-Menu-count"
                >
                  633
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('triggers an `onRefine` callback when clicking a link', () => {
    const props = createProps({});
    const { container } = render(<Menu {...props} />);

    const links = container.querySelectorAll('.ais-Menu-link');
    expect(links.length).toBe(2);

    links.forEach((link) => {
      userEvent.click(link);
    });

    expect(props.onRefine).toHaveBeenCalledTimes(links.length);
  });

  describe('Show more / less', () => {
    test('displays a "Show more" button', () => {
      const props = createProps({});
      const { container } = render(<Menu {...props} showMore />);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-Menu"
          >
            <ul
              class="ais-Menu-list"
            >
              <li
                class="ais-Menu-item ais-Menu-item--selected"
              >
                <a
                  class="ais-Menu-link"
                  href="#Insignia™"
                >
                  <span
                    class="ais-Menu-label"
                  >
                    Insignia™
                  </span>
                  <span
                    class="ais-Menu-count"
                  >
                    746
                  </span>
                </a>
              </li>
              <li
                class="ais-Menu-item"
              >
                <a
                  class="ais-Menu-link"
                  href="#Samsung"
                >
                  <span
                    class="ais-Menu-label"
                  >
                    Samsung
                  </span>
                  <span
                    class="ais-Menu-count"
                  >
                    633
                  </span>
                </a>
              </li>
            </ul>
            <button
              class="ais-Menu-showMore"
            >
              Show more
            </button>
          </div>
        </div>
      `);
    });

    test('calls onToggleShowMore', () => {
      const props = createProps({});
      const { container } = render(<Menu {...props} showMore />);

      const showMore = container.querySelector('.ais-Menu-showMore')!;

      expect(props.onToggleShowMore).not.toHaveBeenCalled();

      userEvent.click(showMore);

      expect(props.onToggleShowMore).toHaveBeenCalledTimes(1);
    });
  });

  test('forwards a custom class name to the root element', () => {
    const props = createProps({ className: 'MyMenu' });
    const { container } = render(<Menu {...props} />);

    expect(container.querySelector('.ais-Menu')).toHaveClass('ais-Menu MyMenu');
  });

  test('allows custom class names', () => {
    const props = createProps({
      showMore: true,
      canToggleShowMore: false,
      classNames: {
        root: 'ROOT',
        list: 'LIST',
        item: 'ITEM',
        selectedItem: 'SELECTEDITEM',
        label: 'LABEL',
        link: 'LINK',
        count: 'COUNT',
        showMore: 'SHOWMORE',
        disabledShowMore: 'DISABLEDSHOWMORE',
      },
    });
    const { container } = render(<Menu {...props} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Menu ROOT"
        >
          <ul
            class="ais-Menu-list LIST"
          >
            <li
              class="ais-Menu-item ITEM ais-Menu-item--selected SELECTEDITEM"
            >
              <a
                class="ais-Menu-link LINK"
                href="#Insignia™"
              >
                <span
                  class="ais-Menu-label LABEL"
                >
                  Insignia™
                </span>
                <span
                  class="ais-Menu-count COUNT"
                >
                  746
                </span>
              </a>
            </li>
            <li
              class="ais-Menu-item ITEM"
            >
              <a
                class="ais-Menu-link LINK"
                href="#Samsung"
              >
                <span
                  class="ais-Menu-label LABEL"
                >
                  Samsung
                </span>
                <span
                  class="ais-Menu-count COUNT"
                >
                  633
                </span>
              </a>
            </li>
          </ul>
          <button
            class="ais-Menu-showMore SHOWMORE ais-Menu-showMore--disabled DISABLEDSHOWMORE"
            disabled=""
          >
            Show more
          </button>
        </div>
      </div>
    `);
  });

  test('allows custom class names (empty)', () => {
    const props = createProps({ items: [] });
    const { container } = render(
      <Menu
        {...props}
        classNames={{ root: 'ROOT', noRefinementRoot: 'NOREFINEMENTROOT' }}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Menu ROOT ais-Menu--noRefinement NOREFINEMENTROOT"
        >
          <ul
            class="ais-Menu-list"
          />
        </div>
      </div>
    `);
  });

  test('forwards `div` props to the root element', () => {
    const props = createProps({ title: 'Some custom title' });
    const { container } = render(<Menu {...props} />);

    expect(container.querySelector('.ais-Menu')).toHaveAttribute(
      'title',
      'Some custom title'
    );
  });
});
