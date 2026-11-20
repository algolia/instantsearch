/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { fireEvent, render } from '@testing-library/preact';
import { Fragment, createElement } from 'preact';

import { createMenuComponent } from '../Menu';

import type { MenuProps } from '../Menu';

describe('Menu', () => {
  const Menu = createMenuComponent({ createElement, Fragment });

  function createProps(props: Partial<MenuProps> = {}): MenuProps {
    return {
      items: [
        { value: 'Apple', label: 'Apple', count: 12345, isRefined: true },
        { value: 'Samsung', label: 'Samsung', count: 42, isRefined: false },
      ],
      createURL: (value) => `#${value}`,
      onRefine: jest.fn(),
      ...props,
    };
  }

  test('renders the default markup', () => {
    const { container } = render(<Menu {...createProps()} />);

    expect(container.firstChild).toMatchInlineSnapshot(`
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
              href="#Apple"
            >
              <span
                class="ais-Menu-label"
              >
                Apple
              </span>
              <span
                class="ais-Menu-count"
              >
                12,345
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
                42
              </span>
            </a>
          </li>
        </ul>
      </div>
    `);
  });

  test('adds the noRefinement modifier without items', () => {
    const { container } = render(<Menu {...createProps({ items: [] })} />);

    expect(container.firstChild).toHaveClass(
      'ais-Menu',
      'ais-Menu--noRefinement'
    );
  });

  test('refines on click and keeps modifier clicks', () => {
    const props = createProps();
    const { container } = render(<Menu {...props} />);
    const link = container.querySelectorAll('.ais-Menu-link')[1];

    fireEvent.click(link, { metaKey: true });
    expect(props.onRefine).not.toHaveBeenCalled();

    expect(fireEvent.click(link)).toBe(false);
    expect(props.onRefine).toHaveBeenCalledWith(props.items[1]);
  });

  test('has no click handler without onRefine', () => {
    const { container } = render(
      <Menu {...createProps({ onRefine: undefined })} />
    );

    expect(fireEvent.click(container.querySelector('.ais-Menu-link')!)).toBe(
      true
    );
  });

  test('renders the show more button', () => {
    const onToggleShowMore = jest.fn();
    const { container, rerender } = render(
      <Menu
        {...createProps({
          showMore: true,
          canToggleShowMore: false,
          onToggleShowMore,
        })}
      />
    );
    const button = container.querySelector('.ais-Menu-showMore')!;

    expect(button).toHaveClass('ais-Menu-showMore--disabled');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Show more');

    rerender(
      <Menu
        {...createProps({
          showMore: true,
          canToggleShowMore: true,
          isShowingMore: true,
          onToggleShowMore,
          translations: { showMoreButtonLabel: 'Toggle' },
        })}
      />
    );

    expect(button).not.toHaveClass('ais-Menu-showMore--disabled');
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAttribute('aria-label', 'Toggle');
    expect(button).toHaveTextContent('Show less');

    fireEvent.click(button);
    expect(onToggleShowMore).toHaveBeenCalledTimes(1);
  });

  test('renders a custom show more text', () => {
    const { container } = render(
      <Menu
        {...createProps({
          showMore: true,
          showMoreTextComponent: ({ isShowingMore }) =>
            isShowingMore ? 'Less' : 'More',
        })}
      />
    );

    expect(container.querySelector('.ais-Menu-showMore')).toHaveTextContent(
      'More'
    );
  });

  test('renders a custom item component', () => {
    const { container } = render(
      <Menu
        {...createProps({
          itemComponent: ({ item, className, children }) => (
            <li className={className} data-value={item.value}>
              {children}
            </li>
          ),
        })}
      />
    );

    const items = container.querySelectorAll('.ais-Menu-item');
    expect(items[0]).toHaveAttribute('data-value', 'Apple');
    expect(items[0].querySelector('.ais-Menu-link')).not.toBeNull();
  });

  test('forwards classNames', () => {
    const { container } = render(
      <Menu
        {...createProps({
          items: [
            { value: 'Apple', label: 'Apple', count: 1, isRefined: true },
          ],
          showMore: true,
          classNames: {
            root: 'ROOT',
            list: 'LIST',
            item: 'ITEM',
            selectedItem: 'SELECTED',
            link: 'LINK',
            label: 'LABEL',
            count: 'COUNT',
            showMore: 'SHOWMORE',
            disabledShowMore: 'DISABLED',
          },
        })}
      />
    );

    expect(container.querySelector('.ais-Menu')).toHaveClass('ROOT');
    expect(container.querySelector('.ais-Menu-list')).toHaveClass('LIST');
    expect(container.querySelector('.ais-Menu-item')).toHaveClass(
      'ITEM',
      'SELECTED'
    );
    expect(container.querySelector('.ais-Menu-link')).toHaveClass('LINK');
    expect(container.querySelector('.ais-Menu-label')).toHaveClass('LABEL');
    expect(container.querySelector('.ais-Menu-count')).toHaveClass('COUNT');
    expect(container.querySelector('.ais-Menu-showMore')).toHaveClass(
      'SHOWMORE',
      'DISABLED'
    );
  });
});
