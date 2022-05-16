import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { HierarchicalMenu } from '../HierarchicalMenu';

import type { HierarchicalMenuProps } from '../HierarchicalMenu';

describe('HierarchicalMenu', () => {
  function createProps(
    props: Partial<HierarchicalMenuProps> = {}
  ): HierarchicalMenuProps {
    return {
      items: [
        {
          label: 'Apple',
          value: 'Apple',
          count: 100,
          isRefined: true,
          data: [
            {
              label: 'iPhone',
              value: 'iPhone',
              count: 50,
              isRefined: false,
              data: null,
            },
            {
              label: 'iPad',
              value: 'iPad',
              count: 50,
              isRefined: false,
              data: null,
            },
          ],
        },
        {
          label: 'Samsung',
          value: 'Samsung',
          count: 100,
          isRefined: false,
          data: null,
        },
      ],
      hasItems: true,
      onNavigate: jest.fn(),
      createURL: jest.fn((value: string) => `#${value}`),
      onToggleShowMore: jest.fn(),
      canToggleShowMore: true,
      isShowingMore: false,
      ...props,
    };
  }

  test('renders with props', () => {
    const props = createProps();
    const { container } = render(<HierarchicalMenu {...props} />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-HierarchicalMenu"
        >
          <ul
            class="ais-HierarchicalMenu-list"
          >
            <li
              class="ais-HierarchicalMenu-item ais-HierarchicalMenu-item--parent ais-HierarchicalMenu-item--selected"
            >
              <a
                class="ais-HierarchicalMenu-link"
                href="#Apple"
              >
                <span
                  class="ais-HierarchicalMenu-labelText"
                >
                  Apple
                </span>
                <span
                  class="ais-HierarchicalMenu-count"
                >
                  100
                </span>
              </a>
              <ul
                class="ais-HierarchicalMenu-list ais-HierarchicalMenu-list--child"
              >
                <li
                  class="ais-HierarchicalMenu-item"
                >
                  <a
                    class="ais-HierarchicalMenu-link"
                    href="#iPhone"
                  >
                    <span
                      class="ais-HierarchicalMenu-labelText"
                    >
                      iPhone
                    </span>
                    <span
                      class="ais-HierarchicalMenu-count"
                    >
                      50
                    </span>
                  </a>
                </li>
                <li
                  class="ais-HierarchicalMenu-item"
                >
                  <a
                    class="ais-HierarchicalMenu-link"
                    href="#iPad"
                  >
                    <span
                      class="ais-HierarchicalMenu-labelText"
                    >
                      iPad
                    </span>
                    <span
                      class="ais-HierarchicalMenu-count"
                    >
                      50
                    </span>
                  </a>
                </li>
              </ul>
            </li>
            <li
              class="ais-HierarchicalMenu-item"
            >
              <a
                class="ais-HierarchicalMenu-link"
                href="#Samsung"
              >
                <span
                  class="ais-HierarchicalMenu-labelText"
                >
                  Samsung
                </span>
                <span
                  class="ais-HierarchicalMenu-count"
                >
                  100
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('calls an `onNavigate` callback when clicking a checkbox', () => {
    const props = createProps();
    const { container } = render(<HierarchicalMenu {...props} />);

    userEvent.click(
      container.querySelector('[href="#iPad"]') as HTMLAnchorElement
    );

    expect(props.onNavigate).toHaveBeenCalledTimes(1);
    expect(props.onNavigate).toHaveBeenCalledWith('iPad');
  });

  describe('Show more / less', () => {
    test('displays a "Show more" button', () => {
      const props = createProps();
      const { container } = render(<HierarchicalMenu {...props} showMore />);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-HierarchicalMenu"
          >
            <ul
              class="ais-HierarchicalMenu-list"
            >
              <li
                class="ais-HierarchicalMenu-item ais-HierarchicalMenu-item--parent ais-HierarchicalMenu-item--selected"
              >
                <a
                  class="ais-HierarchicalMenu-link"
                  href="#Apple"
                >
                  <span
                    class="ais-HierarchicalMenu-labelText"
                  >
                    Apple
                  </span>
                  <span
                    class="ais-HierarchicalMenu-count"
                  >
                    100
                  </span>
                </a>
                <ul
                  class="ais-HierarchicalMenu-list ais-HierarchicalMenu-list--child"
                >
                  <li
                    class="ais-HierarchicalMenu-item"
                  >
                    <a
                      class="ais-HierarchicalMenu-link"
                      href="#iPhone"
                    >
                      <span
                        class="ais-HierarchicalMenu-labelText"
                      >
                        iPhone
                      </span>
                      <span
                        class="ais-HierarchicalMenu-count"
                      >
                        50
                      </span>
                    </a>
                  </li>
                  <li
                    class="ais-HierarchicalMenu-item"
                  >
                    <a
                      class="ais-HierarchicalMenu-link"
                      href="#iPad"
                    >
                      <span
                        class="ais-HierarchicalMenu-labelText"
                      >
                        iPad
                      </span>
                      <span
                        class="ais-HierarchicalMenu-count"
                      >
                        50
                      </span>
                    </a>
                  </li>
                </ul>
              </li>
              <li
                class="ais-HierarchicalMenu-item"
              >
                <a
                  class="ais-HierarchicalMenu-link"
                  href="#Samsung"
                >
                  <span
                    class="ais-HierarchicalMenu-labelText"
                  >
                    Samsung
                  </span>
                  <span
                    class="ais-HierarchicalMenu-count"
                  >
                    100
                  </span>
                </a>
              </li>
            </ul>
            <button
              class="ais-HierarchicalMenu-showMore"
            >
              Show more
            </button>
          </div>
        </div>
      `);
    });

    test('calls onToggleShowMore', () => {
      const props = createProps();
      const { container } = render(<HierarchicalMenu {...props} showMore />);

      const showMore = container.querySelector(
        '.ais-HierarchicalMenu-showMore'
      ) as HTMLButtonElement;

      expect(props.onToggleShowMore).not.toHaveBeenCalled();

      userEvent.click(showMore);

      expect(props.onToggleShowMore).toHaveBeenCalledTimes(1);
    });
  });

  test('accepts custom class names', () => {
    const props = createProps({
      showMore: true,
      canToggleShowMore: false,
      className: 'MyCustomHierarchicalMenu',
      classNames: {
        root: 'ROOT',
        noRefinementRoot: 'NOREFINEMENTROOT',
        list: 'LIST',
        childList: 'CHILDLIST',
        item: 'ITEM',
        selectedItem: 'SELECTEDITEM',
        parentItem: 'PARENTITEM',
        link: 'LINK',
        label: 'LABEL',
        count: 'COUNT',
        showMore: 'SHOWMORE',
        disabledShowMore: 'DISABLEDSHOWMORE',
      },
    });
    const { container } = render(<HierarchicalMenu {...props} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-HierarchicalMenu ROOT MyCustomHierarchicalMenu"
        >
          <ul
            class="ais-HierarchicalMenu-list LIST"
          >
            <li
              class="ais-HierarchicalMenu-item ITEM ais-HierarchicalMenu-item--parent PARENTITEM ais-HierarchicalMenu-item--selected SELECTEDITEM"
            >
              <a
                class="ais-HierarchicalMenu-link LINK"
                href="#Apple"
              >
                <span
                  class="ais-HierarchicalMenu-labelText LABEL"
                >
                  Apple
                </span>
                <span
                  class="ais-HierarchicalMenu-count COUNT"
                >
                  100
                </span>
              </a>
              <ul
                class="ais-HierarchicalMenu-list LIST ais-HierarchicalMenu-list--child CHILDLIST"
              >
                <li
                  class="ais-HierarchicalMenu-item ITEM"
                >
                  <a
                    class="ais-HierarchicalMenu-link LINK"
                    href="#iPhone"
                  >
                    <span
                      class="ais-HierarchicalMenu-labelText LABEL"
                    >
                      iPhone
                    </span>
                    <span
                      class="ais-HierarchicalMenu-count COUNT"
                    >
                      50
                    </span>
                  </a>
                </li>
                <li
                  class="ais-HierarchicalMenu-item ITEM"
                >
                  <a
                    class="ais-HierarchicalMenu-link LINK"
                    href="#iPad"
                  >
                    <span
                      class="ais-HierarchicalMenu-labelText LABEL"
                    >
                      iPad
                    </span>
                    <span
                      class="ais-HierarchicalMenu-count COUNT"
                    >
                      50
                    </span>
                  </a>
                </li>
              </ul>
            </li>
            <li
              class="ais-HierarchicalMenu-item ITEM"
            >
              <a
                class="ais-HierarchicalMenu-link LINK"
                href="#Samsung"
              >
                <span
                  class="ais-HierarchicalMenu-labelText LABEL"
                >
                  Samsung
                </span>
                <span
                  class="ais-HierarchicalMenu-count COUNT"
                >
                  100
                </span>
              </a>
            </li>
          </ul>
          <button
            class="ais-HierarchicalMenu-showMore SHOWMORE ais-HierarchicalMenu-showMore--disabled DISABLEDSHOWMORE"
            disabled=""
          >
            Show more
          </button>
        </div>
      </div>
    `);
  });

  test('forwards `div` props to the root element', () => {
    const props = createProps({ title: 'Some custom title' });
    const { container } = render(<HierarchicalMenu {...props} />);

    expect(container.querySelector('.ais-HierarchicalMenu')).toHaveAttribute(
      'title',
      'Some custom title'
    );
  });
});
