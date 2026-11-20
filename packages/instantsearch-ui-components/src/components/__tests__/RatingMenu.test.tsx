/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { fireEvent, render } from '@testing-library/preact';
import { Fragment, createElement } from 'preact';

import { createRatingMenuComponent } from '../RatingMenu';

import type { RatingMenuProps } from '../RatingMenu';

describe('RatingMenu', () => {
  const RatingMenu = createRatingMenuComponent({ createElement, Fragment });

  function createProps(props: Partial<RatingMenuProps> = {}): RatingMenuProps {
    return {
      items: [
        {
          value: '2',
          label: '2',
          count: 12345,
          isRefined: true,
          stars: [true, true, false],
        },
        {
          value: '1',
          label: '1',
          count: 0,
          isRefined: false,
          stars: [true, false, false],
        },
      ],
      createURL: (value) => `#${value}`,
      onRefine: jest.fn(),
      ...props,
    };
  }

  test('renders the default markup', () => {
    const { container } = render(<RatingMenu {...createProps()} />);

    expect(container.firstChild).toMatchInlineSnapshot(`
      <div
        class="ais-RatingMenu"
      >
        <svg
          style="display: none;"
        >
          <symbol
            id="ais-RatingMenu-starSymbol"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 .288l2.833 8.718h9.167l-7.417 5.389 2.833 8.718-7.416-5.388-7.417 5.388 2.833-8.718-7.416-5.389h9.167z"
            />
          </symbol>
          <symbol
            id="ais-RatingMenu-starEmptySymbol"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 6.76l1.379 4.246h4.465l-3.612 2.625 1.379 4.246-3.611-2.625-3.612 2.625 1.379-4.246-3.612-2.625h4.465l1.38-4.246zm0-6.472l-2.833 8.718h-9.167l7.416 5.389-2.833 8.718 7.417-5.388 7.416 5.388-2.833-8.718 7.417-5.389h-9.167l-2.833-8.718z"
            />
          </symbol>
        </svg>
        <ul
          class="ais-RatingMenu-list"
        >
          <li
            class="ais-RatingMenu-item ais-RatingMenu-item--selected"
          >
            <a
              aria-label="2 & up"
              class="ais-RatingMenu-link"
              href="#2"
            >
              <svg
                aria-hidden="true"
                class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
                height="24"
                width="24"
              >
                <use
                  href="#ais-RatingMenu-starSymbol"
                />
              </svg>
              <svg
                aria-hidden="true"
                class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
                height="24"
                width="24"
              >
                <use
                  href="#ais-RatingMenu-starSymbol"
                />
              </svg>
              <svg
                aria-hidden="true"
                class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
                height="24"
                width="24"
              >
                <use
                  href="#ais-RatingMenu-starEmptySymbol"
                />
              </svg>
              <span
                aria-hidden="true"
                class="ais-RatingMenu-label"
              >
                & Up
              </span>
              <span
                class="ais-RatingMenu-count"
              >
                12,345
              </span>
            </a>
          </li>
          <li
            class="ais-RatingMenu-item ais-RatingMenu-item--disabled"
          >
            <div
              aria-disabled="true"
              aria-label="1 & up"
              class="ais-RatingMenu-link"
            >
              <svg
                aria-hidden="true"
                class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
                height="24"
                width="24"
              >
                <use
                  href="#ais-RatingMenu-starSymbol"
                />
              </svg>
              <svg
                aria-hidden="true"
                class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
                height="24"
                width="24"
              >
                <use
                  href="#ais-RatingMenu-starEmptySymbol"
                />
              </svg>
              <svg
                aria-hidden="true"
                class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
                height="24"
                width="24"
              >
                <use
                  href="#ais-RatingMenu-starEmptySymbol"
                />
              </svg>
              <span
                aria-hidden="true"
                class="ais-RatingMenu-label"
              >
                & Up
              </span>
              <span
                class="ais-RatingMenu-count"
              >
                0
              </span>
            </div>
          </li>
        </ul>
      </div>
    `);
  });

  test('refines on click and keeps modifier clicks', () => {
    const props = createProps();
    const { container } = render(<RatingMenu {...props} />);
    const link = container.querySelector('a.ais-RatingMenu-link')!;

    fireEvent.click(link, { shiftKey: true });
    expect(props.onRefine).not.toHaveBeenCalled();

    expect(fireEvent.click(link)).toBe(false);
    expect(props.onRefine).toHaveBeenCalledWith(props.items[0]);
  });

  test('disables items without results', () => {
    const props = createProps();
    const { container } = render(<RatingMenu {...props} />);
    const item = container.querySelectorAll('.ais-RatingMenu-item')[1];

    expect(item).toHaveClass('ais-RatingMenu-item--disabled');
    expect(item.querySelector('a')).toBeNull();

    fireEvent.click(item.querySelector('.ais-RatingMenu-link')!);
    expect(props.onRefine).not.toHaveBeenCalled();
  });

  test('renders custom texts', () => {
    const { container } = render(
      <RatingMenu
        {...createProps({
          andUpComponent: () => <strong>and more</strong>,
          translations: { itemAriaLabel: ({ value }) => `${value}+` },
        })}
      />
    );

    expect(container.querySelector('.ais-RatingMenu-label')!.innerHTML).toBe(
      '<strong>and more</strong>'
    );
    expect(container.querySelector('.ais-RatingMenu-link')).toHaveAttribute(
      'aria-label',
      '2+'
    );
  });

  test('renders a custom item component', () => {
    const { container } = render(
      <RatingMenu
        {...createProps({
          itemComponent: ({ item, className, children }) => (
            <li className={className} data-value={item.value}>
              {children}
            </li>
          ),
        })}
      />
    );

    expect(container.querySelector('.ais-RatingMenu-item')).toHaveAttribute(
      'data-value',
      '2'
    );
  });

  test('forwards classNames', () => {
    const { container } = render(
      <RatingMenu
        {...createProps({
          classNames: {
            root: 'ROOT',
            list: 'LIST',
            item: 'ITEM',
            selectedItem: 'SELECTED',
            disabledItem: 'DISABLED',
            link: 'LINK',
            starIcon: 'STAR',
            fullStarIcon: 'FULL',
            emptyStarIcon: 'EMPTY',
            label: 'LABEL',
            count: 'COUNT',
          },
        })}
      />
    );
    const [first, second] = container.querySelectorAll('.ais-RatingMenu-item');

    expect(container.querySelector('.ais-RatingMenu')).toHaveClass('ROOT');
    expect(container.querySelector('.ais-RatingMenu-list')).toHaveClass('LIST');
    expect(first).toHaveClass('ITEM', 'SELECTED');
    expect(second).toHaveClass('ITEM', 'DISABLED');
    expect(first.querySelector('.ais-RatingMenu-link')).toHaveClass('LINK');
    expect(first.querySelector('.ais-RatingMenu-starIcon--full')).toHaveClass(
      'STAR',
      'FULL'
    );
    expect(first.querySelector('.ais-RatingMenu-starIcon--empty')).toHaveClass(
      'STAR',
      'EMPTY'
    );
    expect(first.querySelector('.ais-RatingMenu-label')).toHaveClass('LABEL');
    expect(first.querySelector('.ais-RatingMenu-count')).toHaveClass('COUNT');
  });
});
