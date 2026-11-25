/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { fireEvent, render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { Fragment, createElement } from 'preact';

import { createPaginationComponent } from '../Pagination';

import type { PaginationProps } from '../Pagination';

describe('Pagination', () => {
  const Pagination = createPaginationComponent({
    createElement,
    Fragment,
  });

  function createProps(props: Partial<PaginationProps> = {}): PaginationProps {
    return {
      pages: [0, 1, 2],
      currentPage: 0,
      nbPages: 3,
      isFirstPage: true,
      isLastPage: false,
      createURL: (page) => `/?page=${page + 1}`,
      onNavigate: jest.fn(),
      ...props,
    };
  }

  test('renders with default props', () => {
    const { container } = render(<Pagination {...createProps()} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Pagination"
        >
          <ul
            class="ais-Pagination-list"
          >
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--firstPage"
            >
              <span
                aria-label="First Page"
                class="ais-Pagination-link"
              >
                ‹‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--previousPage"
            >
              <span
                aria-label="Previous Page"
                class="ais-Pagination-link"
              >
                ‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected"
            >
              <a
                aria-current="page"
                aria-label="Page 1"
                class="ais-Pagination-link"
                href="/?page=1"
              >
                1
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 2"
                class="ais-Pagination-link"
                href="/?page=2"
              >
                2
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 3"
                class="ais-Pagination-link"
                href="/?page=3"
              >
                3
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--nextPage"
            >
              <a
                aria-label="Next Page"
                class="ais-Pagination-link"
                href="/?page=2"
              >
                ›
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--lastPage"
            >
              <a
                aria-label="Last Page, Page 3"
                class="ais-Pagination-link"
                href="/?page=3"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('adds the noRefinement modifier with a single page', () => {
    const { container } = render(
      <Pagination
        {...createProps({
          pages: [0],
          nbPages: 1,
          isLastPage: true,
          classNames: { noRefinementRoot: 'NO_REFINEMENT' },
        })}
      />
    );

    expect(container.firstChild).toHaveClass(
      'ais-Pagination',
      'ais-Pagination--noRefinement',
      'NO_REFINEMENT'
    );
  });

  test('disables next and last page on the last page', () => {
    const { container } = render(
      <Pagination
        {...createProps({
          currentPage: 2,
          isFirstPage: false,
          isLastPage: true,
        })}
      />
    );

    expect(
      container.querySelector('.ais-Pagination-item--firstPage a')
    ).toHaveAttribute('href', '/?page=1');
    expect(
      container.querySelector('.ais-Pagination-item--previousPage a')
    ).toHaveAttribute('href', '/?page=2');
    expect(
      container.querySelector('.ais-Pagination-item--nextPage')
    ).toHaveClass('ais-Pagination-item--disabled');
    expect(
      container.querySelector('.ais-Pagination-item--nextPage span')
    ).toHaveAttribute('aria-label', 'Next Page');
    expect(
      container.querySelector('.ais-Pagination-item--lastPage span')
    ).toHaveAttribute('aria-label', 'Last Page, Page 3');
  });

  test('calls `onNavigate` with the target page on click', () => {
    const props = createProps({
      currentPage: 1,
      isFirstPage: false,
    });
    const { container } = render(<Pagination {...props} />);

    userEvent.click(
      container.querySelector('.ais-Pagination-item--firstPage a')!
    );
    userEvent.click(
      container.querySelector('.ais-Pagination-item--previousPage a')!
    );
    userEvent.click(container.querySelectorAll('.ais-Pagination-link')[4]);
    userEvent.click(
      container.querySelector('.ais-Pagination-item--nextPage a')!
    );
    userEvent.click(
      container.querySelector('.ais-Pagination-item--lastPage a')!
    );

    expect((props.onNavigate as jest.Mock).mock.calls).toEqual([
      [0],
      [0],
      [2],
      [2],
      [2],
    ]);
  });

  test('prevents the default link behavior on click', () => {
    const { container } = render(<Pagination {...createProps()} />);
    const link = container.querySelector('.ais-Pagination-item--nextPage a')!;

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  test('does not call `onNavigate` on modifier clicks', () => {
    const props = createProps();
    const { container } = render(<Pagination {...props} />);
    const link = container.querySelector('.ais-Pagination-item--nextPage a')!;

    fireEvent.click(link, { button: 1 });
    fireEvent.click(link, { altKey: true });
    fireEvent.click(link, { ctrlKey: true });
    fireEvent.click(link, { metaKey: true });
    fireEvent.click(link, { shiftKey: true });

    expect(props.onNavigate).not.toHaveBeenCalled();
  });

  test('hides the controls disabled through `show*` props', () => {
    const { container } = render(
      <Pagination
        {...createProps({
          showFirst: false,
          showPrevious: false,
          showNext: false,
          showLast: false,
        })}
      />
    );

    expect(container.querySelectorAll('.ais-Pagination-item')).toHaveLength(3);
    expect(
      container.querySelectorAll('.ais-Pagination-item--page')
    ).toHaveLength(3);
  });

  test('accepts custom translations', () => {
    const { container } = render(
      <Pagination
        {...createProps({
          translations: {
            firstPageItemText: 'First',
            previousPageItemText: 'Previous',
            nextPageItemText: 'Next',
            lastPageItemText: 'Last',
            pageItemText: ({ currentPage, nbPages }) =>
              `${currentPage}/${nbPages}`,
            firstPageItemAriaLabel: 'Go to first',
            previousPageItemAriaLabel: 'Go to previous',
            nextPageItemAriaLabel: 'Go to next',
            lastPageItemAriaLabel: 'Go to last',
            pageItemAriaLabel: ({ currentPage }) => `Go to ${currentPage}`,
          },
        })}
      />
    );

    expect(
      Array.from(container.querySelectorAll('.ais-Pagination-link')).map(
        (link) => [link.textContent, link.getAttribute('aria-label')]
      )
    ).toEqual([
      ['First', 'Go to first'],
      ['Previous', 'Go to previous'],
      ['1/3', 'Go to 1'],
      ['2/3', 'Go to 2'],
      ['3/3', 'Go to 3'],
      ['Next', 'Go to next'],
      ['Last', 'Go to last'],
    ]);
  });

  test('accepts custom class names', () => {
    const { container } = render(
      <Pagination
        {...createProps({
          className: 'MyPagination',
          classNames: {
            root: 'ROOT',
            list: 'LIST',
            item: 'ITEM',
            firstPageItem: 'FIRST',
            previousPageItem: 'PREVIOUS',
            pageItem: 'PAGE',
            selectedItem: 'SELECTED',
            disabledItem: 'DISABLED',
            nextPageItem: 'NEXT',
            lastPageItem: 'LAST',
            link: 'LINK',
          },
        })}
      />
    );

    expect(container.firstChild).toHaveClass(
      'ais-Pagination',
      'ROOT',
      'MyPagination'
    );
    expect(container.querySelector('.ais-Pagination-list')).toHaveClass('LIST');
    expect(
      container.querySelector('.ais-Pagination-item--firstPage')
    ).toHaveClass('ITEM', 'DISABLED', 'FIRST');
    expect(
      container.querySelector('.ais-Pagination-item--previousPage')
    ).toHaveClass('ITEM', 'DISABLED', 'PREVIOUS');
    expect(
      container.querySelector('.ais-Pagination-item--selected')
    ).toHaveClass('ITEM', 'PAGE', 'SELECTED');
    expect(
      container.querySelector('.ais-Pagination-item--nextPage')
    ).toHaveClass('ITEM', 'NEXT');
    expect(
      container.querySelector('.ais-Pagination-item--lastPage')
    ).toHaveClass('ITEM', 'LAST');
    container.querySelectorAll('.ais-Pagination-link').forEach((link) => {
      expect(link).toHaveClass('LINK');
    });
  });

  test('overrides the link content with `linkTextComponent`', () => {
    const { container } = render(
      <Pagination
        {...createProps({
          linkTextComponent: ({ type, page }) =>
            type === 'lastPage' ? null : <em>{`${type}:${page}`}</em>,
        })}
      />
    );

    expect(
      Array.from(container.querySelectorAll('.ais-Pagination-item')).map(
        (item) => item.innerHTML
      )
    ).toEqual([
      '<span class="ais-Pagination-link" aria-label="First Page"><em>firstPage:0</em></span>',
      '<span class="ais-Pagination-link" aria-label="Previous Page"><em>previousPage:-1</em></span>',
      '<a class="ais-Pagination-link" aria-label="Page 1" aria-current="page" href="/?page=1"><em>page:0</em></a>',
      '<a class="ais-Pagination-link" aria-label="Page 2" href="/?page=2"><em>page:1</em></a>',
      '<a class="ais-Pagination-link" aria-label="Page 3" href="/?page=3"><em>page:2</em></a>',
      '<a class="ais-Pagination-link" aria-label="Next Page" href="/?page=2"><em>nextPage:1</em></a>',
      '',
    ]);
  });

  test('overrides each item with `itemComponent`', () => {
    const itemComponent = jest.fn(
      ({ type, page, isDisabled, isSelected, className, children }) =>
        type === 'nextPage' ? (
          <li className={className} data-page={page}>
            <button type="button">Custom next</button>
          </li>
        ) : (
          <li
            className={className}
            data-disabled={String(isDisabled)}
            data-selected={String(isSelected)}
          >
            {children}
          </li>
        )
    );
    const { container } = render(
      <Pagination {...createProps()} itemComponent={itemComponent} />
    );

    expect(itemComponent).toHaveBeenCalledTimes(7);
    expect(itemComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'firstPage',
        page: 0,
        isDisabled: true,
        isSelected: false,
        className:
          'ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--firstPage',
      }),
      expect.anything()
    );

    expect(
      container.querySelector('.ais-Pagination-item--nextPage')!.outerHTML
    ).toBe(
      '<li class="ais-Pagination-item ais-Pagination-item--nextPage" data-page="1"><button type="button">Custom next</button></li>'
    );
    expect(
      container.querySelector('.ais-Pagination-item--selected')!.outerHTML
    ).toBe(
      '<li class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected" data-disabled="false" data-selected="true"><a class="ais-Pagination-link" aria-label="Page 1" aria-current="page" href="/?page=1">1</a></li>'
    );
  });
});
