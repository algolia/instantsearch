/**
 * @jest-environment jsdom
 */

import {
  createMultiSearchResponse,
  createAlgoliaSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { Pagination } from '../Pagination';

import type { MockSearchClient } from '@instantsearch/mocks';
import type { SearchClient } from 'instantsearch.js';

function createMockedSearchClient({ nbPages }: { nbPages?: number } = {}) {
  return createAlgoliaSearchClient({
    search: jest.fn((requests) =>
      Promise.resolve(
        createMultiSearchResponse(
          ...requests.map(
            (request: Parameters<SearchClient['search']>[0][number]) =>
              createSingleSearchResponse({
                hits: Array.from({ length: 1000 }).map((_, index) => ({
                  objectID: String(index),
                })),
                index: request.indexName,
                nbPages,
              })
          )
        )
      )
    ) as MockSearchClient['search'],
  });
}

describe('Pagination', () => {
  test('renders with default props', async () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <Pagination />
      </InstantSearchTestWrapper>
    );

    await waitFor(() =>
      expect(container.querySelectorAll('.ais-Pagination-item').length).toEqual(
        5
      )
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
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
                href="#"
              >
                1
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
  });

  test('renders with props', async () => {
    const searchClient = createMockedSearchClient();
    const { container } = render(
      <InstantSearchTestWrapper searchClient={searchClient}>
        <Pagination />
      </InstantSearchTestWrapper>
    );

    await waitFor(() =>
      expect(
        document.querySelectorAll('.ais-Pagination-item--page')
      ).toHaveLength(7)
    );

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
                aria-label="Next"
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
                aria-label="Last"
                class="ais-Pagination-link"
                href="#"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('navigates between pages', async () => {
    const searchClient = createMockedSearchClient();
    const { container, getByText } = render(
      <InstantSearchTestWrapper searchClient={searchClient}>
        <Pagination />
      </InstantSearchTestWrapper>
    );

    await waitFor(() =>
      expect(
        document.querySelectorAll('.ais-Pagination-item--page')
      ).toHaveLength(7)
    );

    expect(
      document.querySelector('.ais-Pagination-item--selected')
    ).toHaveTextContent('1');
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
                aria-label="Next"
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
                aria-label="Last"
                class="ais-Pagination-link"
                href="#"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);

    const firstPageItem = document.querySelector(
      '.ais-Pagination-item--firstPage'
    );
    const previousPageItem = document.querySelector(
      '.ais-Pagination-item--previousPage'
    );
    const nextPageItem = document.querySelector(
      '.ais-Pagination-item--nextPage'
    );
    const lastPageItem = document.querySelector(
      '.ais-Pagination-item--lastPage'
    );

    searchClient.search.mockClear();

    // We're on page 1, "First" and "Previous" links are disabled
    expect(firstPageItem).toHaveClass('ais-Pagination-item--disabled');
    expect(previousPageItem).toHaveClass('ais-Pagination-item--disabled');

    userEvent.click(
      firstPageItem!.querySelector('.ais-Pagination-link') as HTMLAnchorElement
    );
    userEvent.click(
      previousPageItem!.querySelector(
        '.ais-Pagination-link'
      ) as HTMLAnchorElement
    );

    await waitFor(() => expect(searchClient.search).not.toHaveBeenCalled());

    // We navigate to page 2
    userEvent.click(getByText('2'));

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenLastCalledWith([
        expect.objectContaining({
          params: expect.objectContaining({ page: 1 }),
        }),
      ]);
      expect(
        document.querySelector('.ais-Pagination-item--selected')
      ).toHaveTextContent('2');
    });

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
                href="#"
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
                href="#"
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
                href="#"
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
                aria-label="Next"
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
                aria-label="Last"
                class="ais-Pagination-link"
                href="#"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);

    // We click on "Next" link
    userEvent.click(getByText('›'));

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenLastCalledWith([
        expect.objectContaining({
          params: expect.objectContaining({ page: 2 }),
        }),
      ]);
      expect(
        document.querySelector('.ais-Pagination-item--selected')
      ).toHaveTextContent('3');
    });

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
                href="#"
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
                href="#"
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
              class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected"
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
                aria-label="Next"
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
                aria-label="Last"
                class="ais-Pagination-link"
                href="#"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);

    // We click on "Last" link
    userEvent.click(getByText('››'));

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenLastCalledWith([
        expect.objectContaining({
          params: expect.objectContaining({ page: 49 }),
        }),
      ]);
      expect(
        document.querySelector('.ais-Pagination-item--selected')
      ).toHaveTextContent('50');
    });

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
                href="#"
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
                href="#"
              >
                ‹
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 44"
                class="ais-Pagination-link"
                href="#"
              >
                44
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 45"
                class="ais-Pagination-link"
                href="#"
              >
                45
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 46"
                class="ais-Pagination-link"
                href="#"
              >
                46
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 47"
                class="ais-Pagination-link"
                href="#"
              >
                47
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 48"
                class="ais-Pagination-link"
                href="#"
              >
                48
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 49"
                class="ais-Pagination-link"
                href="#"
              >
                49
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected"
            >
              <a
                aria-label="Page 50"
                class="ais-Pagination-link"
                href="#"
              >
                50
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

    searchClient.search.mockClear();

    // We're on last page, "Next" and "Last" links are disabled
    expect(nextPageItem).toHaveClass('ais-Pagination-item--disabled');
    expect(lastPageItem).toHaveClass('ais-Pagination-item--disabled');

    userEvent.click(
      nextPageItem!.querySelector('.ais-Pagination-link') as HTMLAnchorElement
    );
    userEvent.click(
      lastPageItem!.querySelector('.ais-Pagination-link') as HTMLAnchorElement
    );

    await waitFor(() => expect(searchClient.search).not.toHaveBeenCalled());

    // We click on "Previous" link
    userEvent.click(
      previousPageItem!.querySelector(
        '.ais-Pagination-link'
      ) as HTMLAnchorElement
    );

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenLastCalledWith([
        expect.objectContaining({
          params: expect.objectContaining({ page: 48 }),
        }),
      ]);
      expect(
        document.querySelector('.ais-Pagination-item--selected')
      ).toHaveTextContent('49');
    });

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
                href="#"
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
                href="#"
              >
                ‹
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 44"
                class="ais-Pagination-link"
                href="#"
              >
                44
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 45"
                class="ais-Pagination-link"
                href="#"
              >
                45
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 46"
                class="ais-Pagination-link"
                href="#"
              >
                46
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 47"
                class="ais-Pagination-link"
                href="#"
              >
                47
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 48"
                class="ais-Pagination-link"
                href="#"
              >
                48
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected"
            >
              <a
                aria-label="Page 49"
                class="ais-Pagination-link"
                href="#"
              >
                49
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 50"
                class="ais-Pagination-link"
                href="#"
              >
                50
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--nextPage"
            >
              <a
                aria-label="Next"
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
                aria-label="Last"
                class="ais-Pagination-link"
                href="#"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);

    // We click on "First" link
    userEvent.click(
      firstPageItem!.querySelector('.ais-Pagination-link') as HTMLAnchorElement
    );

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenLastCalledWith([
        expect.objectContaining({
          params: expect.objectContaining({ page: 0 }),
        }),
      ]);
      expect(
        document.querySelector('.ais-Pagination-item--selected')
      ).toHaveTextContent('1');
    });

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
                aria-label="Next"
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
                aria-label="Last"
                class="ais-Pagination-link"
                href="#"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('does not navigate when pressing a modifier key', async () => {
    const searchClient = createMockedSearchClient();
    const { getByText } = render(
      <InstantSearchTestWrapper searchClient={searchClient}>
        <Pagination />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));

    searchClient.search.mockClear();

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

    expect(searchClient.search).not.toHaveBeenCalled();
  });

  test('adds items around the current one', async () => {
    const searchClient = createMockedSearchClient();
    const { container } = render(
      <InstantSearchTestWrapper searchClient={searchClient}>
        <Pagination padding={4} />
      </InstantSearchTestWrapper>
    );

    await waitFor(() =>
      expect(
        document.querySelectorAll('.ais-Pagination-item--page')
      ).toHaveLength(9)
    );

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
                aria-label="Next"
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
                aria-label="Last"
                class="ais-Pagination-link"
                href="#"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('does not add items around the current one when there are not enough pages', async () => {
    const client = createAlgoliaSearchClient({
      search: jest.fn((requests: Parameters<SearchClient['search']>[0]) =>
        Promise.resolve(
          createMultiSearchResponse(
            ...requests.map((request) =>
              createSingleSearchResponse({
                hits: Array.from({ length: 120 }).map((_, index) => ({
                  objectID: String(index),
                })),
                index: request.indexName,
              })
            )
          )
        )
      ) as MockSearchClient['search'],
    });

    const { container } = render(
      <InstantSearchTestWrapper searchClient={client}>
        <Pagination padding={4} />
      </InstantSearchTestWrapper>
    );

    await waitFor(() =>
      expect(
        document.querySelectorAll('.ais-Pagination-item--page')
      ).toHaveLength(6)
    );

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
                aria-label="Next"
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
                aria-label="Last"
                class="ais-Pagination-link"
                href="#"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('limits the total pages to display', async () => {
    const searchClient = createMockedSearchClient();
    const { container } = render(
      <InstantSearchTestWrapper searchClient={searchClient}>
        <Pagination totalPages={4} />
      </InstantSearchTestWrapper>
    );

    await waitFor(() =>
      expect(
        document.querySelectorAll('.ais-Pagination-item--page')
      ).toHaveLength(4)
    );

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
                aria-label="Next"
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
                aria-label="Last"
                class="ais-Pagination-link"
                href="#"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('hides the "First" item when `showFirst` is `false`', async () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <Pagination showFirst={false} />
      </InstantSearchTestWrapper>
    );

    await waitFor(() =>
      expect(
        Array.from(container.querySelectorAll('.ais-Pagination-item')).map(
          (item) => item.textContent
        )
      ).toEqual(['‹', '1', '›', '››'])
    );

    expect(
      document.querySelector('.ais-Pagination-item--firstPage')
    ).toBeNull();
    expect(container).toMatchInlineSnapshot(`
      <div>
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
                href="#"
              >
                1
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
  });

  test('hides the "Previous" item when `showPrevious` is `false`', async () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <Pagination showPrevious={false} />
      </InstantSearchTestWrapper>
    );

    await waitFor(() =>
      expect(
        Array.from(container.querySelectorAll('.ais-Pagination-item')).map(
          (item) => item.textContent
        )
      ).toEqual(['‹‹', '1', '›', '››'])
    );

    expect(
      document.querySelector('.ais-Pagination-item--previousPage')
    ).toBeNull();
    expect(container).toMatchInlineSnapshot(`
      <div>
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
                href="#"
              >
                1
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
  });

  test('hides the "Next" item when `showNext` is `false`', async () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <Pagination showNext={false} />
      </InstantSearchTestWrapper>
    );

    await waitFor(() =>
      expect(
        Array.from(container.querySelectorAll('.ais-Pagination-item')).map(
          (item) => item.textContent
        )
      ).toEqual(['‹‹', '‹', '1', '››'])
    );

    expect(document.querySelector('.ais-Pagination-item--nextPage')).toBeNull();
    expect(container).toMatchInlineSnapshot(`
      <div>
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
                href="#"
              >
                1
              </a>
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
  });

  test('hides the "Last" item when `showLast` is `false`', async () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <Pagination showLast={false} />
      </InstantSearchTestWrapper>
    );

    await waitFor(() =>
      expect(
        Array.from(container.querySelectorAll('.ais-Pagination-item')).map(
          (item) => item.textContent
        )
      ).toEqual(['‹‹', '‹', '1', '›'])
    );

    expect(document.querySelector('.ais-Pagination-item--lastPage')).toBeNull();
    expect(container).toMatchInlineSnapshot(`
      <div>
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
                href="#"
              >
                1
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
          </ul>
        </div>
      </div>
    `);
  });

  test('forwards custom class names and `div` props to the root element', () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <Pagination
          className="MyPagination"
          classNames={{ root: 'ROOT' }}
          title="Some custom title"
        />
      </InstantSearchTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyPagination', 'ROOT');
    expect(root).toHaveAttribute('title', 'Some custom title');
  });

  test('renders with translations', async () => {
    const { getByRole, findByRole } = render(
      <InstantSearchTestWrapper
        searchClient={createMockedSearchClient({ nbPages: 3 })}
      >
        <Pagination
          translations={{
            firstPageItemAriaLabel: 'First page',
            lastPageItemAriaLabel: 'Last page',
            nextPageItemAriaLabel: 'Next page',
            previousPageItemAriaLabel: 'Previous page',
            pageItemAriaLabel: ({ currentPage, nbPages }) =>
              `Page number ${currentPage} of ${nbPages}`,
            firstPageItemText: 'First',
            lastPageItemText: 'Last',
            nextPageItemText: 'Next',
            previousPageItemText: 'Previous',
            pageItemText: ({ currentPage, nbPages }) =>
              `#${currentPage}/${nbPages}`,
          }}
        />
      </InstantSearchTestWrapper>
    );

    await waitFor(() =>
      expect(
        document.querySelectorAll('.ais-Pagination-item--page')
      ).toHaveLength(3)
    );

    // So we can test all links, we choose a page in the middle
    userEvent.click(
      getByRole('link', {
        name: /page number 2 of 3/i,
      })
    );

    const firstPageLink = await findByRole('link', {
      name: 'First page',
    });
    expect(firstPageLink).toHaveTextContent('First');

    const previousPageLink = getByRole('link', {
      name: 'Previous page',
    });
    expect(previousPageLink).toHaveTextContent('Previous');

    const nextPageLink = getByRole('link', {
      name: 'Next page',
    });
    expect(nextPageLink).toHaveTextContent('Next');

    const lastPageLink = getByRole('link', {
      name: 'Last page',
    });
    expect(lastPageLink).toHaveTextContent('Last');

    const pageLink = getByRole('link', {
      name: /page number 1 of 3/i,
    });
    expect(pageLink).toHaveTextContent('#1/3');
  });
});
