import {
  createAlgoliaSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import {
  normalizeSnapshot as commonNormalizeSnapshot,
  wait,
} from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import type { PaginationWidgetSetup } from '.';
import type { TestOptions } from '../../common';
import type { MockSearchClient } from '@instantsearch/mocks';
import type { SearchClient } from 'instantsearch.js';

function normalizeSnapshot(html: string) {
  // InstantSearch.js uses different text in the page items.
  // @MAJOR: Standardize page item text between all flavors.
  return commonNormalizeSnapshot(html)
    .replace('«', '‹‹')
    .replace('»', '››')
    .replace(
      /(<span[^>]*class="ais-Pagination-link"[^>]*>)([^<]*)(<\/span>)/g,
      (_, open, content, close) => `${open}${content.trim()}${close}`
    );
}

export function createOptionsTests(
  setup: PaginationWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('options', () => {
    test('renders with default props', async () => {
      const searchClient = createMockedSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {},
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelectorAll('.ais-Pagination-item--page')
      ).toHaveLength(7);
      expect(
        document.querySelectorAll('.ais-Pagination-item--page')[0]
      ).toHaveClass('ais-Pagination-item--selected');
      expect(
        document.querySelector('.ais-Pagination-item--firstPage')
      ).toHaveClass('ais-Pagination-item--disabled');
      expect(
        document.querySelector('.ais-Pagination-item--previousPage')
      ).toHaveClass('ais-Pagination-item--disabled');
      expect(
        document.querySelector('.ais-Pagination-item--nextPage')
      ).not.toHaveClass('ais-Pagination-item--disabled');
      expect(
        document.querySelector('.ais-Pagination-item--lastPage')
      ).not.toHaveClass('ais-Pagination-item--disabled');

      expect(
        document.querySelector('.ais-Pagination')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
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
                aria-label="Page 1"
                class="ais-Pagination-link"
                href="#"
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
                href="#"
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
                href="#"
              >
                3
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 4"
                class="ais-Pagination-link"
                href="#"
              >
                4
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 5"
                class="ais-Pagination-link"
                href="#"
              >
                5
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 6"
                class="ais-Pagination-link"
                href="#"
              >
                6
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 7"
                class="ais-Pagination-link"
                href="#"
              >
                7
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--nextPage"
            >
              <a
                aria-label="Next Page"
                class="ais-Pagination-link"
                href="#"
              >
                ›
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--lastPage"
            >
              <a
                aria-label="Last Page, Page 50"
                class="ais-Pagination-link"
                href="#"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      `
      );
    });

    test('navigates between pages', async () => {
      const searchClient = createMockedSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {},
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelectorAll('.ais-Pagination-item--page')
      ).toHaveLength(7);
      expect(
        document.querySelector('.ais-Pagination-item--selected')
      ).toHaveTextContent('1');
      expect(
        document.querySelector('.ais-Pagination')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
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
                aria-label="Page 1"
                class="ais-Pagination-link"
                href="#"
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
                href="#"
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
                href="#"
              >
                3
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 4"
                class="ais-Pagination-link"
                href="#"
              >
                4
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 5"
                class="ais-Pagination-link"
                href="#"
              >
                5
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 6"
                class="ais-Pagination-link"
                href="#"
              >
                6
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 7"
                class="ais-Pagination-link"
                href="#"
              >
                7
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--nextPage"
            >
              <a
                aria-label="Next Page"
                class="ais-Pagination-link"
                href="#"
              >
                ›
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--lastPage"
            >
              <a
                aria-label="Last Page, Page 50"
                class="ais-Pagination-link"
                href="#"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      `
      );

      const firstPageItem = document.querySelector(
        '.ais-Pagination-item--firstPage'
      )!;
      const previousPageItem = document.querySelector(
        '.ais-Pagination-item--previousPage'
      )!;
      const nextPageItem = document.querySelector(
        '.ais-Pagination-item--nextPage'
      )!;
      const lastPageItem = document.querySelector(
        '.ais-Pagination-item--lastPage'
      )!;

      searchClient.search.mockClear();

      // We're on page 1, "First" and "Previous" links are disabled
      expect(firstPageItem).toHaveClass('ais-Pagination-item--disabled');
      expect(previousPageItem).toHaveClass('ais-Pagination-item--disabled');

      userEvent.click(
        firstPageItem.querySelector<HTMLAnchorElement>('.ais-Pagination-link')!
      );
      userEvent.click(
        previousPageItem.querySelector<HTMLAnchorElement>(
          '.ais-Pagination-link'
        )!
      );

      await act(async () => {
        await wait(0);
      });

      expect(searchClient.search).not.toHaveBeenCalled();

      // We navigate to page 2
      userEvent.click(screen.getByText('2'));

      await act(async () => {
        await wait(0);
      });

      expect(searchClient.search).toHaveBeenLastCalledWith([
        expect.objectContaining({
          params: expect.objectContaining({ page: 1 }),
        }),
      ]);
      expect(
        document.querySelector('.ais-Pagination-item--selected')
      ).toHaveTextContent('2');

      // We're on page 2, "First" and "Previous" links are no longer disabled
      expect(firstPageItem).not.toHaveClass('ais-Pagination-item--disabled');
      expect(previousPageItem).not.toHaveClass('ais-Pagination-item--disabled');

      // We click on "Next" link
      userEvent.click(
        nextPageItem.querySelector<HTMLAnchorElement>('.ais-Pagination-link')!
      );

      await act(async () => {
        await wait(0);
      });

      expect(searchClient.search).toHaveBeenLastCalledWith([
        expect.objectContaining({
          params: expect.objectContaining({ page: 2 }),
        }),
      ]);
      expect(
        document.querySelector('.ais-Pagination-item--selected')
      ).toHaveTextContent('3');

      // We click on "Last" link
      // InstantSearch.js uses different text in the page items.
      // @MAJOR: Standardize page item text between all flavors.
      userEvent.click(
        lastPageItem.querySelector<HTMLAnchorElement>('.ais-Pagination-link')!
      );

      await act(async () => {
        await wait(0);
      });

      expect(searchClient.search).toHaveBeenLastCalledWith([
        expect.objectContaining({
          params: expect.objectContaining({ page: 49 }),
        }),
      ]);
      expect(
        document.querySelector('.ais-Pagination-item--selected')
      ).toHaveTextContent('50');

      // We're on the last page, "Next" and "Last" links are disabled
      expect(nextPageItem).toHaveClass('ais-Pagination-item--disabled');
      expect(lastPageItem).toHaveClass('ais-Pagination-item--disabled');

      searchClient.search.mockClear();

      userEvent.click(
        nextPageItem.querySelector<HTMLAnchorElement>('.ais-Pagination-link')!
      );
      userEvent.click(
        lastPageItem.querySelector<HTMLAnchorElement>('.ais-Pagination-link')!
      );

      await act(async () => {
        await wait(0);
      });

      expect(searchClient.search).not.toHaveBeenCalled();

      // We click on "Previous" link
      userEvent.click(
        previousPageItem.querySelector<HTMLAnchorElement>(
          '.ais-Pagination-link'
        )!
      );

      await act(async () => {
        await wait(0);
      });

      expect(searchClient.search).toHaveBeenLastCalledWith([
        expect.objectContaining({
          params: expect.objectContaining({ page: 48 }),
        }),
      ]);
      expect(
        document.querySelector('.ais-Pagination-item--selected')
      ).toHaveTextContent('49');

      // We're on page 49, "Next" and "Last" links are no longer disabled
      expect(nextPageItem).not.toHaveClass('ais-Pagination-item--disabled');
      expect(lastPageItem).not.toHaveClass('ais-Pagination-item--disabled');

      // We click on "First" link
      userEvent.click(
        firstPageItem.querySelector<HTMLAnchorElement>('.ais-Pagination-link')!
      );

      await act(async () => {
        await wait(0);
      });

      expect(searchClient.search).toHaveBeenLastCalledWith([
        expect.objectContaining({
          params: expect.objectContaining({ page: 0 }),
        }),
      ]);
      expect(
        document.querySelector('.ais-Pagination-item--selected')
      ).toHaveTextContent('1');

      // We're back on page 1, "First" and "Previous" links are disabled
      expect(firstPageItem).toHaveClass('ais-Pagination-item--disabled');
      expect(previousPageItem).toHaveClass('ais-Pagination-item--disabled');
    });

    test('does not navigate when pressing a modifier key', async () => {
      const searchClient = createMockedSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {},
      });

      await act(async () => {
        await wait(0);
      });

      expect(searchClient.search).toHaveBeenCalledTimes(1);

      searchClient.search.mockClear();

      const firstPageItem = document.querySelector(
        '.ais-Pagination-item--firstPage'
      )!;
      const firstPageLink = firstPageItem.querySelector<HTMLAnchorElement>(
        '.ais-Pagination-link'
      )!;

      userEvent.click(firstPageLink, { button: 1 });
      userEvent.click(firstPageLink, { altKey: true });
      userEvent.click(firstPageLink, { ctrlKey: true });
      userEvent.click(firstPageLink, { metaKey: true });
      userEvent.click(firstPageLink, { shiftKey: true });

      const previousPageItem = document.querySelector(
        '.ais-Pagination-item--previousPage'
      )!;
      const previousPageLink =
        previousPageItem.querySelector<HTMLAnchorElement>(
          '.ais-Pagination-link'
        )!;

      userEvent.click(previousPageLink, { button: 1 });
      userEvent.click(previousPageLink, { altKey: true });
      userEvent.click(previousPageLink, { ctrlKey: true });
      userEvent.click(previousPageLink, { metaKey: true });
      userEvent.click(previousPageLink, {
        shiftKey: true,
      });

      const nextPageItem = document.querySelector(
        '.ais-Pagination-item--nextPage'
      );
      const nextPageLink = nextPageItem!.querySelector<HTMLAnchorElement>(
        '.ais-Pagination-link'
      )!;

      userEvent.click(nextPageLink, { button: 1 });
      userEvent.click(nextPageLink, { altKey: true });
      userEvent.click(nextPageLink, { ctrlKey: true });
      userEvent.click(nextPageLink, { metaKey: true });
      userEvent.click(nextPageLink, { shiftKey: true });

      const lastPageItem = document.querySelector(
        '.ais-Pagination-item--lastPage'
      );
      const lastPageLink = lastPageItem!.querySelector<HTMLAnchorElement>(
        '.ais-Pagination-link'
      )!;

      userEvent.click(lastPageLink, { button: 1 });
      userEvent.click(lastPageLink, { altKey: true });
      userEvent.click(lastPageLink, { ctrlKey: true });
      userEvent.click(lastPageLink, { metaKey: true });
      userEvent.click(lastPageLink, { shiftKey: true });

      const pageOneLink = screen.getByText<HTMLAnchorElement>('1');

      userEvent.click(pageOneLink, { button: 1 });
      userEvent.click(pageOneLink, { altKey: true });
      userEvent.click(pageOneLink, { ctrlKey: true });
      userEvent.click(pageOneLink, { metaKey: true });
      userEvent.click(pageOneLink, { shiftKey: true });

      expect(searchClient.search).not.toHaveBeenCalled();
    });

    test('adds items around the current one', async () => {
      const searchClient = createMockedSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: { padding: 4 },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelectorAll('.ais-Pagination-item--page')
      ).toHaveLength(9);

      expect(
        document.querySelector('.ais-Pagination')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
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
                aria-label="Page 1"
                class="ais-Pagination-link"
                href="#"
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
                href="#"
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
                href="#"
              >
                3
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 4"
                class="ais-Pagination-link"
                href="#"
              >
                4
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 5"
                class="ais-Pagination-link"
                href="#"
              >
                5
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 6"
                class="ais-Pagination-link"
                href="#"
              >
                6
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 7"
                class="ais-Pagination-link"
                href="#"
              >
                7
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 8"
                class="ais-Pagination-link"
                href="#"
              >
                8
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 9"
                class="ais-Pagination-link"
                href="#"
              >
                9
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--nextPage"
            >
              <a
                aria-label="Next Page"
                class="ais-Pagination-link"
                href="#"
              >
                ›
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--lastPage"
            >
              <a
                aria-label="Last Page, Page 50"
                class="ais-Pagination-link"
                href="#"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      `
      );
    });

    test('does not add items around the current one when there are not enough pages', async () => {
      const searchClient = createMockedSearchClient({ nbHits: 120 });

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: { padding: 4 },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelectorAll('.ais-Pagination-item--page')
      ).toHaveLength(6);

      expect(
        document.querySelector('.ais-Pagination')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
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
                aria-label="Page 1"
                class="ais-Pagination-link"
                href="#"
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
                href="#"
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
                href="#"
              >
                3
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 4"
                class="ais-Pagination-link"
                href="#"
              >
                4
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 5"
                class="ais-Pagination-link"
                href="#"
              >
                5
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 6"
                class="ais-Pagination-link"
                href="#"
              >
                6
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--nextPage"
            >
              <a
                aria-label="Next Page"
                class="ais-Pagination-link"
                href="#"
              >
                ›
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--lastPage"
            >
              <a
                aria-label="Last Page, Page 6"
                class="ais-Pagination-link"
                href="#"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      `
      );
    });

    test('does not display a next page when outside of range', async () => {
      const searchClient = createMockedSearchClient({ nbHits: 120 });

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
          initialUiState: {
            indexName: { page: 200 },
          },
        },
        widgetParams: { padding: 4 },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelectorAll('.ais-Pagination-item--page')
      ).toHaveLength(6);
      expect(
        document.querySelector('.ais-Pagination-item--nextPage')
      ).toHaveClass('ais-Pagination-item--disabled');
      expect(
        document.querySelector('.ais-Pagination-item--lastPage')
      ).toHaveClass('ais-Pagination-item--disabled');
    });

    test('does not display a next previous page when outside of range', async () => {
      const searchClient = createMockedSearchClient({ nbHits: 120 });

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
          initialUiState: {
            indexName: { page: -4 },
          },
        },
        widgetParams: { padding: 4 },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelectorAll('.ais-Pagination-item--page')
      ).toHaveLength(6);
      expect(
        document.querySelector('.ais-Pagination-item--previousPage')
      ).toHaveClass('ais-Pagination-item--disabled');
      expect(
        document.querySelector('.ais-Pagination-item--firstPage')
      ).toHaveClass('ais-Pagination-item--disabled');
    });

    test('limits the total pages to display', async () => {
      const searchClient = createMockedSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: { totalPages: 4 },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelectorAll('.ais-Pagination-item--page')
      ).toHaveLength(4);

      expect(
        document.querySelector('.ais-Pagination')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
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
                aria-label="Page 1"
                class="ais-Pagination-link"
                href="#"
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
                href="#"
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
                href="#"
              >
                3
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 4"
                class="ais-Pagination-link"
                href="#"
              >
                4
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--nextPage"
            >
              <a
                aria-label="Next Page"
                class="ais-Pagination-link"
                href="#"
              >
                ›
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--lastPage"
            >
              <a
                aria-label="Last Page, Page 4"
                class="ais-Pagination-link"
                href="#"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      `
      );
    });

    test('hides the "First" item when `showFirst` is `false`', async () => {
      const searchClient = createAlgoliaSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: { showFirst: false },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-Pagination-item--firstPage')
      ).toBeNull();

      expect(
        document.querySelector('.ais-Pagination')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-Pagination ais-Pagination--noRefinement"
        >
          <ul
            class="ais-Pagination-list"
          >
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
                aria-label="Page 1"
                class="ais-Pagination-link"
                href="#"
              >
                1
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--nextPage"
            >
              <span
                aria-label="Next Page"
                class="ais-Pagination-link"
              >
                ›
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--lastPage"
            >
              <span
                aria-label="Last Page, Page 0"
                class="ais-Pagination-link"
              >
                ››
              </span>
            </li>
          </ul>
        </div>
      `
      );
    });

    test('hides the "Previous" item when `showPrevious` is `false`', async () => {
      const searchClient = createAlgoliaSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: { showPrevious: false },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-Pagination-item--previousPage')
      ).toBeNull();

      expect(
        document.querySelector('.ais-Pagination')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-Pagination ais-Pagination--noRefinement"
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
              class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected"
            >
              <a
                aria-label="Page 1"
                class="ais-Pagination-link"
                href="#"
              >
                1
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--nextPage"
            >
              <span
                aria-label="Next Page"
                class="ais-Pagination-link"
              >
                ›
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--lastPage"
            >
              <span
                aria-label="Last Page, Page 0"
                class="ais-Pagination-link"
              >
                ››
              </span>
            </li>
          </ul>
        </div>
      `
      );
    });

    test('hides the "Next" item when `showNext` is `false`', async () => {
      const searchClient = createAlgoliaSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: { showNext: false },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-Pagination-item--nextPage')
      ).toBeNull();

      expect(
        document.querySelector('.ais-Pagination')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-Pagination ais-Pagination--noRefinement"
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
                aria-label="Page 1"
                class="ais-Pagination-link"
                href="#"
              >
                1
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--lastPage"
            >
              <span
                aria-label="Last Page, Page 0"
                class="ais-Pagination-link"
              >
                ››
              </span>
            </li>
          </ul>
        </div>
      `
      );
    });

    test('hides the "Last" item when `showLast` is `false`', async () => {
      const searchClient = createAlgoliaSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: { showLast: false },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-Pagination-item--lastPage')
      ).toBeNull();

      expect(
        document.querySelector('.ais-Pagination')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-Pagination ais-Pagination--noRefinement"
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
                aria-label="Page 1"
                class="ais-Pagination-link"
                href="#"
              >
                1
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--nextPage"
            >
              <span
                aria-label="Next Page"
                class="ais-Pagination-link"
              >
                ›
              </span>
            </li>
          </ul>
        </div>
      `
      );
    });
  });
}

function createMockedSearchClient({ nbHits = 1000 }: { nbHits?: number } = {}) {
  return createAlgoliaSearchClient({
    search: jest.fn((requests) =>
      Promise.resolve(
        createMultiSearchResponse(
          ...requests.map(
            (request: Parameters<SearchClient['search']>[0][number]) =>
              createSingleSearchResponse({
                hits: Array.from({ length: nbHits }).map((_, index) => ({
                  objectID: String(index),
                })),
                index: request.indexName,
              })
          )
        )
      )
    ) as MockSearchClient['search'],
  });
}
