/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { fireEvent, render } from '@testing-library/preact';
import { Fragment, createElement } from 'preact';

import { createHierarchicalMenuComponent } from '../HierarchicalMenu';

import type { HierarchicalMenuProps } from '../HierarchicalMenu';

describe('HierarchicalMenu', () => {
  const HierarchicalMenu = createHierarchicalMenuComponent({
    createElement,
    Fragment,
  });

  function createProps(
    props: Partial<HierarchicalMenuProps> = {}
  ): HierarchicalMenuProps {
    return {
      items: [
        {
          value: 'Appliances',
          label: 'Appliances',
          count: 4306,
          isRefined: true,
          data: [
            {
              value: 'Appliances > Fans',
              label: 'Fans',
              count: 91,
              isRefined: false,
              data: null,
            },
          ],
        },
        {
          value: 'Audio',
          label: 'Audio',
          count: 1570,
          isRefined: false,
          data: null,
        },
      ],
      createURL: (value) => `#${value}`,
      onRefine: jest.fn(),
      ...props,
    };
  }

  test('renders the default markup', () => {
    const { container } = render(<HierarchicalMenu {...createProps()} />);

    expect(container.firstChild).toMatchInlineSnapshot(`
      <div
        class="ais-HierarchicalMenu"
      >
        <ul
          class="ais-HierarchicalMenu-list ais-HierarchicalMenu-list--lvl0"
        >
          <li
            class="ais-HierarchicalMenu-item ais-HierarchicalMenu-item--selected ais-HierarchicalMenu-item--parent"
          >
            <a
              class="ais-HierarchicalMenu-link ais-HierarchicalMenu-link--selected"
              href="#Appliances"
            >
              <span
                class="ais-HierarchicalMenu-label"
              >
                Appliances
              </span>
              <span
                class="ais-HierarchicalMenu-count"
              >
                4,306
              </span>
            </a>
            <ul
              class="ais-HierarchicalMenu-list ais-HierarchicalMenu-list--child ais-HierarchicalMenu-list--lvl1"
            >
              <li
                class="ais-HierarchicalMenu-item"
              >
                <a
                  class="ais-HierarchicalMenu-link"
                  href="#Appliances > Fans"
                >
                  <span
                    class="ais-HierarchicalMenu-label"
                  >
                    Fans
                  </span>
                  <span
                    class="ais-HierarchicalMenu-count"
                  >
                    91
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
              href="#Audio"
            >
              <span
                class="ais-HierarchicalMenu-label"
              >
                Audio
              </span>
              <span
                class="ais-HierarchicalMenu-count"
              >
                1,570
              </span>
            </a>
          </li>
        </ul>
      </div>
    `);
  });

  test('renders no list without items', () => {
    const { container } = render(
      <HierarchicalMenu {...createProps({ items: [] })} />
    );

    expect(container.firstChild).toHaveClass(
      'ais-HierarchicalMenu--noRefinement'
    );
    expect(container.querySelector('ul')).toBeNull();
  });

  test('refines on click and keeps modifier clicks', () => {
    const props = createProps();
    const { container } = render(<HierarchicalMenu {...props} />);
    const childLink = container.querySelector(
      '.ais-HierarchicalMenu-list--child .ais-HierarchicalMenu-link'
    )!;

    fireEvent.click(childLink, { ctrlKey: true });
    expect(props.onRefine).not.toHaveBeenCalled();

    expect(fireEvent.click(childLink)).toBe(false);
    expect(props.onRefine).toHaveBeenCalledTimes(1);
    expect(props.onRefine).toHaveBeenCalledWith(props.items[0].data![0]);
  });

  test('renders a custom item component with its child list', () => {
    const { container } = render(
      <HierarchicalMenu
        {...createProps({
          itemComponent: ({ item, className, childList }) => (
            <li className={className}>
              <button>{item.label}</button>
              {childList}
            </li>
          ),
        })}
      />
    );

    expect(
      Array.from(container.querySelectorAll('button')).map(
        (button) => button.textContent
      )
    ).toEqual(['Appliances', 'Fans', 'Audio']);
    expect(container.querySelector('.ais-HierarchicalMenu-link')).toBeNull();
  });

  test('renders the show more button', () => {
    const { container } = render(
      <HierarchicalMenu
        {...createProps({ showMore: true, canToggleShowMore: false })}
      />
    );
    const button = container.querySelector('.ais-HierarchicalMenu-showMore')!;

    expect(button).toHaveClass('ais-HierarchicalMenu-showMore--disabled');
    expect(button).toHaveTextContent('Show more');
  });

  test('forwards classNames', () => {
    const { container } = render(
      <HierarchicalMenu
        {...createProps({
          classNames: {
            root: 'ROOT',
            list: 'LIST',
            childList: 'CHILDLIST',
            item: 'ITEM',
            selectedItem: 'SELECTED',
            parentItem: 'PARENT',
            link: 'LINK',
            selectedItemLink: 'SELECTEDLINK',
            label: 'LABEL',
            count: 'COUNT',
          },
        })}
      />
    );

    expect(container.querySelector('.ais-HierarchicalMenu')).toHaveClass(
      'ROOT'
    );
    expect(
      container.querySelector('.ais-HierarchicalMenu-list--lvl0')
    ).toHaveClass('LIST');
    expect(
      container.querySelector('.ais-HierarchicalMenu-list--lvl1')
    ).toHaveClass('LIST', 'CHILDLIST');
    expect(container.querySelector('.ais-HierarchicalMenu-item')).toHaveClass(
      'ITEM',
      'SELECTED',
      'PARENT'
    );
    expect(container.querySelector('.ais-HierarchicalMenu-link')).toHaveClass(
      'LINK',
      'SELECTEDLINK'
    );
    expect(container.querySelector('.ais-HierarchicalMenu-label')).toHaveClass(
      'LABEL'
    );
    expect(container.querySelector('.ais-HierarchicalMenu-count')).toHaveClass(
      'COUNT'
    );
  });
});
