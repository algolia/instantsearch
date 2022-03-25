import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { Pagination } from '../Pagination';

import type { PaginationProps } from '../Pagination';

describe('Pagination', () => {
  function createProps(props: Partial<PaginationProps>) {
    const onNavigate = jest.fn();

    return {
      pages: [0, 1],
      currentPage: 0,
      nbPages: 2,
      isFirstPage: true,
      isLastPage: false,
      showFirst: true,
      showPrevious: true,
      showNext: true,
      showLast: true,
      createURL: (value: number) => `/?page=${value + 1}`,
      onNavigate,
      translations: {
        first: '‹‹',
        previous: '‹',
        next: '›',
        last: '››',
        page: (currentPage: number) => String(currentPage),
        ariaFirst: 'First',
        ariaPrevious: 'Previous',
        ariaNext: 'Next',
        ariaLast: 'Last',
        ariaPage: (currentPage: number) => `Page ${currentPage}`,
      },
      ...props,
    };
  }

  test('renders with items', () => {
    const props = createProps({
      currentPage: 1,
      nbPages: 6,
      isFirstPage: false,
      isLastPage: false,
    });

    const { container } = render(<Pagination {...props} />);

    const firstPageItem = document.querySelector(
      '.ais-Pagination-item--firstPage'
    );
    const firstPageLink = firstPageItem!.querySelector('.ais-Pagination-link');
    const previousPageItem = document.querySelector(
      '.ais-Pagination-item--previousPage'
    );
    const previousPageLink = previousPageItem!.querySelector(
      '.ais-Pagination-link'
    );
    const nextPageItem = document.querySelector(
      '.ais-Pagination-item--nextPage'
    );
    const nextPageLink = nextPageItem!.querySelector('.ais-Pagination-link');
    const lastPageItem = document.querySelector(
      '.ais-Pagination-item--lastPage'
    );
    const lastPageLink = lastPageItem!.querySelector('.ais-Pagination-link');

    expect(firstPageLink).toHaveAttribute('aria-label', 'First');
    expect(firstPageLink).toHaveAttribute('href', '/?page=1');
    expect(previousPageLink).toHaveAttribute('aria-label', 'Previous');
    expect(previousPageLink).toHaveAttribute('href', '/?page=1');

    expect(nextPageLink).toHaveAttribute('aria-label', 'Next');
    expect(nextPageLink).toHaveAttribute('href', '/?page=3');
    expect(lastPageLink).toHaveAttribute('aria-label', 'Last');
    expect(lastPageLink).toHaveAttribute('href', '/?page=6');

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Pagination"
        >
          <ul
            class="ais-Pagination-list"
          >
            <li
              class="ais-Pagination-item ais-Pagination-item--firstPage"
            >
              <a
                aria-label="First"
                class="ais-Pagination-link"
                href="/?page=1"
              >
                ‹‹
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--previousPage"
            >
              <a
                aria-label="Previous"
                class="ais-Pagination-link"
                href="/?page=1"
              >
                ‹
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 1"
                class="ais-Pagination-link"
                href="/?page=1"
              >
                1
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected"
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
              class="ais-Pagination-item ais-Pagination-item--nextPage"
            >
              <a
                aria-label="Next"
                class="ais-Pagination-link"
                href="/?page=3"
              >
                ›
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--lastPage"
            >
              <a
                aria-label="Last"
                class="ais-Pagination-link"
                href="/?page=6"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('enables first and previous page when current page is not the first page', () => {
    const props = createProps({
      currentPage: 1,
      isFirstPage: false,
      isLastPage: true,
    });

    const { container } = render(<Pagination {...props} />);

    const firstPageItem = document.querySelector(
      '.ais-Pagination-item--firstPage'
    );
    const previousPageItem = document.querySelector(
      '.ais-Pagination-item--previousPage'
    );

    expect(firstPageItem).not.toHaveClass('ais-Pagination-item--disabled');
    expect(previousPageItem).not.toHaveClass('ais-Pagination-item--disabled');
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Pagination"
        >
          <ul
            class="ais-Pagination-list"
          >
            <li
              class="ais-Pagination-item ais-Pagination-item--firstPage"
            >
              <a
                aria-label="First"
                class="ais-Pagination-link"
                href="/?page=1"
              >
                ‹‹
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--previousPage"
            >
              <a
                aria-label="Previous"
                class="ais-Pagination-link"
                href="/?page=1"
              >
                ‹
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 1"
                class="ais-Pagination-link"
                href="/?page=1"
              >
                1
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected"
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
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--nextPage"
            >
              <span
                aria-label="Next"
                class="ais-Pagination-link"
              >
                ›
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--lastPage"
            >
              <span
                aria-label="Last"
                class="ais-Pagination-link"
              >
                ››
              </span>
            </li>
          </ul>
        </div>
      </div>
    `);

    userEvent.click(
      firstPageItem!.querySelector('.ais-Pagination-link') as HTMLButtonElement
    );
    userEvent.click(
      previousPageItem!.querySelector(
        '.ais-Pagination-link'
      ) as HTMLButtonElement
    );

    expect(props.onNavigate).toHaveBeenCalledTimes(2);
  });

  test('disables first and previous page when current page is the first page', () => {
    const props = createProps({});

    const { container } = render(<Pagination {...props} />);

    const firstPageItem = document.querySelector(
      '.ais-Pagination-item--firstPage'
    );
    const previousPageItem = document.querySelector(
      '.ais-Pagination-item--previousPage'
    );

    expect(firstPageItem).toHaveClass('ais-Pagination-item--disabled');
    expect(previousPageItem).toHaveClass('ais-Pagination-item--disabled');
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
                aria-label="First"
                class="ais-Pagination-link"
              >
                ‹‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--previousPage"
            >
              <span
                aria-label="Previous"
                class="ais-Pagination-link"
              >
                ‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected"
            >
              <a
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
              class="ais-Pagination-item ais-Pagination-item--nextPage"
            >
              <a
                aria-label="Next"
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
                aria-label="Last"
                class="ais-Pagination-link"
                href="/?page=2"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);

    userEvent.click(
      firstPageItem!.querySelector('.ais-Pagination-link') as HTMLButtonElement
    );
    userEvent.click(
      previousPageItem!.querySelector(
        '.ais-Pagination-link'
      ) as HTMLButtonElement
    );

    expect(props.onNavigate).not.toHaveBeenCalled();
  });

  test('enables next and last page when current page is not the last page', () => {
    const props = createProps({});

    const { container } = render(<Pagination {...props} />);

    const nextPageItem = document.querySelector(
      '.ais-Pagination-item--nextPage'
    );
    const lastPageItem = document.querySelector(
      '.ais-Pagination-item--lastPage'
    );

    expect(nextPageItem).not.toHaveClass('ais-Pagination-item--disabled');
    expect(lastPageItem).not.toHaveClass('ais-Pagination-item--disabled');
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
                aria-label="First"
                class="ais-Pagination-link"
              >
                ‹‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--previousPage"
            >
              <span
                aria-label="Previous"
                class="ais-Pagination-link"
              >
                ‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected"
            >
              <a
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
              class="ais-Pagination-item ais-Pagination-item--nextPage"
            >
              <a
                aria-label="Next"
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
                aria-label="Last"
                class="ais-Pagination-link"
                href="/?page=2"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);

    userEvent.click(
      nextPageItem!.querySelector('.ais-Pagination-link') as HTMLButtonElement
    );
    userEvent.click(
      lastPageItem!.querySelector('.ais-Pagination-link') as HTMLButtonElement
    );

    expect(props.onNavigate).toHaveBeenCalledTimes(2);
  });

  test('disables next and last page when current page is the last page', () => {
    const props = createProps({
      currentPage: 1,
      nbPages: 2,
      isFirstPage: false,
      isLastPage: true,
    });

    const { container } = render(<Pagination {...props} />);

    const nextPageItem = document.querySelector(
      '.ais-Pagination-item--nextPage'
    );
    const lastPageItem = document.querySelector(
      '.ais-Pagination-item--lastPage'
    );

    expect(nextPageItem).toHaveClass('ais-Pagination-item--disabled');
    expect(lastPageItem).toHaveClass('ais-Pagination-item--disabled');
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Pagination"
        >
          <ul
            class="ais-Pagination-list"
          >
            <li
              class="ais-Pagination-item ais-Pagination-item--firstPage"
            >
              <a
                aria-label="First"
                class="ais-Pagination-link"
                href="/?page=1"
              >
                ‹‹
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--previousPage"
            >
              <a
                aria-label="Previous"
                class="ais-Pagination-link"
                href="/?page=1"
              >
                ‹
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 1"
                class="ais-Pagination-link"
                href="/?page=1"
              >
                1
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected"
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
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--nextPage"
            >
              <span
                aria-label="Next"
                class="ais-Pagination-link"
              >
                ›
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--lastPage"
            >
              <span
                aria-label="Last"
                class="ais-Pagination-link"
              >
                ››
              </span>
            </li>
          </ul>
        </div>
      </div>
    `);

    userEvent.click(
      nextPageItem!.querySelector('.ais-Pagination-link') as HTMLButtonElement
    );
    userEvent.click(
      lastPageItem!.querySelector('.ais-Pagination-link') as HTMLButtonElement
    );

    expect(props.onNavigate).not.toHaveBeenCalled();
  });

  test('does not trigger `onNavigate` callback when pressing a modifier key', () => {
    const props = createProps({});

    const { getByText } = render(<Pagination {...props} />);

    const firstPageItem = document.querySelector(
      '.ais-Pagination-item--firstPage'
    );
    const firstPageLink = firstPageItem!.querySelector('.ais-Pagination-link');

    userEvent.click(firstPageLink as HTMLAnchorElement, { button: 1 });
    userEvent.click(firstPageLink as HTMLAnchorElement, { altKey: true });
    userEvent.click(firstPageLink as HTMLAnchorElement, { ctrlKey: true });
    userEvent.click(firstPageLink as HTMLAnchorElement, { metaKey: true });
    userEvent.click(firstPageLink as HTMLAnchorElement, { shiftKey: true });

    const previousPageItem = document.querySelector(
      '.ais-Pagination-item--previousPage'
    );
    const previousPageLink = previousPageItem!.querySelector(
      '.ais-Pagination-link'
    );

    userEvent.click(previousPageLink as HTMLAnchorElement, { button: 1 });
    userEvent.click(previousPageLink as HTMLAnchorElement, { altKey: true });
    userEvent.click(previousPageLink as HTMLAnchorElement, { ctrlKey: true });
    userEvent.click(previousPageLink as HTMLAnchorElement, { metaKey: true });
    userEvent.click(previousPageLink as HTMLAnchorElement, { shiftKey: true });

    const nextPageItem = document.querySelector(
      '.ais-Pagination-item--nextPage'
    );
    const nextPageLink = nextPageItem!.querySelector('.ais-Pagination-link');

    userEvent.click(nextPageLink as HTMLAnchorElement, { button: 1 });
    userEvent.click(nextPageLink as HTMLAnchorElement, { altKey: true });
    userEvent.click(nextPageLink as HTMLAnchorElement, { ctrlKey: true });
    userEvent.click(nextPageLink as HTMLAnchorElement, { metaKey: true });
    userEvent.click(nextPageLink as HTMLAnchorElement, { shiftKey: true });

    const lastPageItem = document.querySelector(
      '.ais-Pagination-item--lastPage'
    );
    const lastPageLink = lastPageItem!.querySelector('.ais-Pagination-link');

    userEvent.click(lastPageLink as HTMLAnchorElement, { button: 1 });
    userEvent.click(lastPageLink as HTMLAnchorElement, { altKey: true });
    userEvent.click(lastPageLink as HTMLAnchorElement, { ctrlKey: true });
    userEvent.click(lastPageLink as HTMLAnchorElement, { metaKey: true });
    userEvent.click(lastPageLink as HTMLAnchorElement, { shiftKey: true });

    const pageOneLink = getByText('1');

    userEvent.click(pageOneLink as HTMLAnchorElement, { button: 1 });
    userEvent.click(pageOneLink as HTMLAnchorElement, { altKey: true });
    userEvent.click(pageOneLink as HTMLAnchorElement, { ctrlKey: true });
    userEvent.click(pageOneLink as HTMLAnchorElement, { metaKey: true });
    userEvent.click(pageOneLink as HTMLAnchorElement, { shiftKey: true });

    expect(props.onNavigate).not.toHaveBeenCalled();
  });

  test('hides the "First" item when `showFirst` is `false`', () => {
    const props = createProps({
      showFirst: false,
    });

    const { container } = render(<Pagination {...props} />);

    expect(
      document.querySelector('.ais-Pagination-item--firstPage')
    ).toBeNull();
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Pagination"
        >
          <ul
            class="ais-Pagination-list"
          >
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--previousPage"
            >
              <span
                aria-label="Previous"
                class="ais-Pagination-link"
              >
                ‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected"
            >
              <a
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
              class="ais-Pagination-item ais-Pagination-item--nextPage"
            >
              <a
                aria-label="Next"
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
                aria-label="Last"
                class="ais-Pagination-link"
                href="/?page=2"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('hides the "Previous" item when `showPrevious` is `false`', () => {
    const props = createProps({
      showPrevious: false,
    });

    const { container } = render(<Pagination {...props} />);

    expect(
      document.querySelector('.ais-Pagination-item--previousPage')
    ).toBeNull();
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
                aria-label="First"
                class="ais-Pagination-link"
              >
                ‹‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected"
            >
              <a
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
              class="ais-Pagination-item ais-Pagination-item--nextPage"
            >
              <a
                aria-label="Next"
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
                aria-label="Last"
                class="ais-Pagination-link"
                href="/?page=2"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('hides the "Next" item when `showNext` is `false`', () => {
    const props = createProps({
      showNext: false,
    });

    const { container } = render(<Pagination {...props} />);

    expect(document.querySelector('.ais-Pagination-item--nextPage')).toBeNull();
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
                aria-label="First"
                class="ais-Pagination-link"
              >
                ‹‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--previousPage"
            >
              <span
                aria-label="Previous"
                class="ais-Pagination-link"
              >
                ‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected"
            >
              <a
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
              class="ais-Pagination-item ais-Pagination-item--lastPage"
            >
              <a
                aria-label="Last"
                class="ais-Pagination-link"
                href="/?page=2"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('hides the "Last" item when `showLast` is `false`', () => {
    const props = createProps({
      showLast: false,
    });

    const { container } = render(<Pagination {...props} />);

    expect(document.querySelector('.ais-Pagination-item--lastPage')).toBeNull();
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
                aria-label="First"
                class="ais-Pagination-link"
              >
                ‹‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--previousPage"
            >
              <span
                aria-label="Previous"
                class="ais-Pagination-link"
              >
                ‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected"
            >
              <a
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
              class="ais-Pagination-item ais-Pagination-item--nextPage"
            >
              <a
                aria-label="Next"
                class="ais-Pagination-link"
                href="/?page=2"
              >
                ›
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('forwards a custom class name to the root element', () => {
    const props = createProps({});

    const { container } = render(
      <Pagination {...props} className="MyPagination" />
    );

    expect(document.querySelector('.ais-Pagination')).toHaveClass(
      'MyPagination'
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Pagination MyPagination"
        >
          <ul
            class="ais-Pagination-list"
          >
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--firstPage"
            >
              <span
                aria-label="First"
                class="ais-Pagination-link"
              >
                ‹‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--previousPage"
            >
              <span
                aria-label="Previous"
                class="ais-Pagination-link"
              >
                ‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected"
            >
              <a
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
              class="ais-Pagination-item ais-Pagination-item--nextPage"
            >
              <a
                aria-label="Next"
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
                aria-label="Last"
                class="ais-Pagination-link"
                href="/?page=2"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('allows custom class names', () => {
    const props = createProps({});
    const { container } = render(
      <Pagination
        {...props}
        classNames={{
          root: 'ROOT',
          rootNoRefinement: 'ROOTNOREFINEMENT',
          list: 'LIST',
          item: 'ITEM',
          itemFirstPage: 'ITEMFIRSTPAGE',
          itemPreviousPage: 'ITEMPREVIOUSPAGE',
          itemPage: 'ITEMPAGE',
          itemSelected: 'ITEMSELECTED',
          itemDisabled: 'ITEMDISABLED',
          itemNextPage: 'ITEMNEXTPAGE',
          itemLastPage: 'ITEMLASTPAGE',
          link: 'LINK',
        }}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Pagination ROOT"
        >
          <ul
            class="ais-Pagination-list LIST"
          >
            <li
              class="ais-Pagination-item ITEM ais-Pagination-item--disabled ITEMDISABLED ais-Pagination-item--firstPage ITEMFIRSTPAGE"
            >
              <span
                aria-label="First"
                class="ais-Pagination-link LINK"
              >
                ‹‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ITEM ais-Pagination-item--disabled ITEMDISABLED ais-Pagination-item--previousPage ITEMPREVIOUSPAGE"
            >
              <span
                aria-label="Previous"
                class="ais-Pagination-link LINK"
              >
                ‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ITEM ais-Pagination-item--page ITEMPAGE ais-Pagination-item--selected ITEMSELECTED"
            >
              <a
                aria-label="Page 1"
                class="ais-Pagination-link LINK"
                href="/?page=1"
              >
                1
              </a>
            </li>
            <li
              class="ais-Pagination-item ITEM ais-Pagination-item--page ITEMPAGE"
            >
              <a
                aria-label="Page 2"
                class="ais-Pagination-link LINK"
                href="/?page=2"
              >
                2
              </a>
            </li>
            <li
              class="ais-Pagination-item ITEM ais-Pagination-item--nextPage ITEMNEXTPAGE"
            >
              <a
                aria-label="Next"
                class="ais-Pagination-link LINK"
                href="/?page=2"
              >
                ›
              </a>
            </li>
            <li
              class="ais-Pagination-item ITEM ais-Pagination-item--lastPage ITEMLASTPAGE"
            >
              <a
                aria-label="Last"
                class="ais-Pagination-link LINK"
                href="/?page=2"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('forwards `div` props to the root element', () => {
    const props = createProps({});

    const { container } = render(
      <Pagination {...props} title="Some custom title" />
    );

    expect(document.querySelector('.ais-Pagination')).toHaveAttribute(
      'title',
      'Some custom title'
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Pagination"
          title="Some custom title"
        >
          <ul
            class="ais-Pagination-list"
          >
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--firstPage"
            >
              <span
                aria-label="First"
                class="ais-Pagination-link"
              >
                ‹‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--previousPage"
            >
              <span
                aria-label="Previous"
                class="ais-Pagination-link"
              >
                ‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected"
            >
              <a
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
              class="ais-Pagination-item ais-Pagination-item--nextPage"
            >
              <a
                aria-label="Next"
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
                aria-label="Last"
                class="ais-Pagination-link"
                href="/?page=2"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);
  });
});
