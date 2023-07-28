/**
 * @jest-environment jsdom
 */

import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { InfiniteHits } from '../InfiniteHits';

import type { MockSearchClient } from '@instantsearch/mocks';

type CustomHit = {
  somethingSpecial: string;
};

function createMockedSearchClient() {
  return createSearchClient({
    search: jest.fn((requests) =>
      Promise.resolve(
        createMultiSearchResponse(
          ...requests.map(
            (request: Parameters<MockSearchClient['search']>[0][number]) => {
              const { hitsPerPage = 3, page = 0 } = request.params!;
              const hits = Array.from({ length: hitsPerPage }, (_, i) => {
                const offset = hitsPerPage * page;
                return {
                  objectID: (i + offset).toString(),
                  somethingSpecial: String.fromCharCode(
                    'a'.charCodeAt(0) + i + offset
                  ),
                };
              });

              return createSingleSearchResponse<CustomHit>({
                hits,
                page,
                nbPages: 10,
                hitsPerPage,
                index: request.indexName,
              });
            }
          )
        )
      )
    ) as MockSearchClient['search'],
  });
}

describe('InfiniteHits', () => {
  test('renders with default props', async () => {
    const searchClient = createMockedSearchClient();
    const { container } = render(
      <InstantSearchTestWrapper searchClient={searchClient}>
        <InfiniteHits />
      </InstantSearchTestWrapper>
    );

    await waitFor(() =>
      expect(container.querySelectorAll('.ais-InfiniteHits-item')).toHaveLength(
        3
      )
    );

    expect(container.querySelector('.ais-InfiniteHits')).toMatchInlineSnapshot(`
        <div
          class="ais-InfiniteHits"
        >
          <button
            class="ais-InfiniteHits-loadPrevious ais-InfiniteHits-loadPrevious--disabled"
            disabled=""
          >
            Show previous results
          </button>
          <ol
            class="ais-InfiniteHits-list"
          >
            <li
              class="ais-InfiniteHits-item"
            >
              <div
                style="word-break: break-all;"
              >
                {"objectID":"0","somethingSpecial":"a","__position":1}
                …
              </div>
            </li>
            <li
              class="ais-InfiniteHits-item"
            >
              <div
                style="word-break: break-all;"
              >
                {"objectID":"1","somethingSpecial":"b","__position":2}
                …
              </div>
            </li>
            <li
              class="ais-InfiniteHits-item"
            >
              <div
                style="word-break: break-all;"
              >
                {"objectID":"2","somethingSpecial":"c","__position":3}
                …
              </div>
            </li>
          </ol>
          <button
            class="ais-InfiniteHits-loadMore"
          >
            Show more results
          </button>
        </div>
      `);
  });

  test('renders with a custom hit component', async () => {
    const searchClient = createMockedSearchClient();
    const { container } = render(
      <InstantSearchTestWrapper searchClient={searchClient}>
        <InfiniteHits<CustomHit>
          hitComponent={({ hit }) => (
            <strong>{`${hit.__position} - ${hit.somethingSpecial}`}</strong>
          )}
        />
      </InstantSearchTestWrapper>
    );

    await waitFor(() =>
      expect(container.querySelectorAll('strong')).toHaveLength(3)
    );

    expect(container.querySelector('.ais-InfiniteHits')).toMatchInlineSnapshot(`
        <div
          class="ais-InfiniteHits"
        >
          <button
            class="ais-InfiniteHits-loadPrevious ais-InfiniteHits-loadPrevious--disabled"
            disabled=""
          >
            Show previous results
          </button>
          <ol
            class="ais-InfiniteHits-list"
          >
            <li
              class="ais-InfiniteHits-item"
            >
              <strong>
                1 - a
              </strong>
            </li>
            <li
              class="ais-InfiniteHits-item"
            >
              <strong>
                2 - b
              </strong>
            </li>
            <li
              class="ais-InfiniteHits-item"
            >
              <strong>
                3 - c
              </strong>
            </li>
          </ol>
          <button
            class="ais-InfiniteHits-loadMore"
          >
            Show more results
          </button>
        </div>
      `);
  });

  test('displays more hits when clicking the "Show More" button', async () => {
    const searchClient = createMockedSearchClient();
    const { container } = render(
      <InstantSearchTestWrapper searchClient={searchClient}>
        <InfiniteHits
          hitComponent={({ hit: { __position } }) => (
            <strong>{__position}</strong>
          )}
        />
      </InstantSearchTestWrapper>
    );

    await waitFor(() =>
      expect(container.querySelectorAll('strong')).toHaveLength(3)
    );

    expect(searchClient.search).toHaveBeenCalledTimes(1);
    expect(searchClient.search).toHaveBeenLastCalledWith([
      {
        indexName: 'indexName',
        params: {
          facets: [],
          highlightPostTag: '__/ais-highlight__',
          highlightPreTag: '__ais-highlight__',
          page: 0,
          tagFilters: '',
        },
      },
    ]);

    act(() => {
      userEvent.click(container.querySelector('.ais-InfiniteHits-loadMore')!);
    });

    await waitFor(() => {
      expect(container.querySelectorAll('strong')).toHaveLength(6);

      expect(searchClient.search).toHaveBeenCalledTimes(2);
      expect(searchClient.search).toHaveBeenLastCalledWith([
        {
          indexName: 'indexName',
          params: {
            facets: [],
            highlightPostTag: '__/ais-highlight__',
            highlightPreTag: '__ais-highlight__',
            page: 1,
            tagFilters: '',
          },
        },
      ]);
    });
  });

  test('displays previous hits when clicking the "Show Previous" button', async () => {
    const searchClient = createMockedSearchClient();
    const { container } = render(
      <InstantSearchTestWrapper
        searchClient={searchClient}
        initialUiState={{ indexName: { page: 4 } }}
      >
        <InfiniteHits
          hitComponent={({ hit: { __position } }) => (
            <strong>{__position}</strong>
          )}
        />
      </InstantSearchTestWrapper>
    );

    await waitFor(() =>
      expect(container.querySelectorAll('strong')).toHaveLength(3)
    );

    expect(searchClient.search).toHaveBeenCalledTimes(1);
    expect(searchClient.search).toHaveBeenLastCalledWith([
      {
        indexName: 'indexName',
        params: {
          facets: [],
          highlightPostTag: '__/ais-highlight__',
          highlightPreTag: '__ais-highlight__',
          page: 3,
          tagFilters: '',
        },
      },
    ]);

    act(() => {
      userEvent.click(
        container.querySelector('.ais-InfiniteHits-loadPrevious')!
      );
    });

    await waitFor(() => {
      expect(container.querySelectorAll('strong')).toHaveLength(6);

      expect(searchClient.search).toHaveBeenCalledTimes(2);
      expect(searchClient.search).toHaveBeenLastCalledWith([
        {
          indexName: 'indexName',
          params: {
            facets: [],
            highlightPostTag: '__/ais-highlight__',
            highlightPreTag: '__ais-highlight__',
            page: 2,
            tagFilters: '',
          },
        },
      ]);
    });
  });

  test('hides the "Show Previous" button when `showPrevious` is `false`', async () => {
    const searchClient = createMockedSearchClient();
    const { container } = render(
      <InstantSearchTestWrapper searchClient={searchClient}>
        <InfiniteHits showPrevious={false} />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => {
      expect(container.querySelector('.ais-InfiniteHits-loadPrevious')).toBe(
        null
      );
      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-InfiniteHits ais-InfiniteHits--empty"
          >
            <ol
              class="ais-InfiniteHits-list"
            />
            <button
              class="ais-InfiniteHits-loadMore ais-InfiniteHits-loadMore--disabled"
              disabled=""
            >
              Show more results
            </button>
          </div>
        </div>
      `);
    });
  });

  test('marks the "Show Previous" button as disabled on first page', async () => {
    const searchClient = createMockedSearchClient();
    const { container } = render(
      <InstantSearchTestWrapper searchClient={searchClient}>
        <InfiniteHits />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));

    expect(
      container.querySelector<HTMLButtonElement>(
        '.ais-InfiniteHits-loadPrevious'
      )
    ).toBeDisabled();

    expect(
      container.querySelector<HTMLButtonElement>(
        '.ais-InfiniteHits-loadPrevious'
      )
    ).toHaveClass(
      'ais-InfiniteHits-loadPrevious',
      'ais-InfiniteHits-loadPrevious--disabled'
    );
  });

  test('marks the "Show More" button as disabled on last page', async () => {
    const searchClient = createMockedSearchClient();
    const { container } = render(
      <InstantSearchTestWrapper
        searchClient={searchClient}
        initialUiState={{ indexName: { page: 10 } }}
      >
        <InfiniteHits />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));

    expect(
      container.querySelector<HTMLButtonElement>('.ais-InfiniteHits-loadMore')
    ).toBeDisabled();

    expect(
      container.querySelector<HTMLButtonElement>('.ais-InfiniteHits-loadMore')
    ).toHaveClass(
      'ais-InfiniteHits-loadMore',
      'ais-InfiniteHits-loadMore--disabled'
    );
  });

  test('forwards custom class names and `div` props to the root element', () => {
    const searchClient = createMockedSearchClient();
    const { container } = render(
      <InstantSearchTestWrapper searchClient={searchClient}>
        <InfiniteHits
          className="MyInfiniteHits"
          classNames={{ root: 'ROOT' }}
          aria-hidden={true}
        />
      </InstantSearchTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyInfiniteHits', 'ROOT');
    expect(root).toHaveAttribute('aria-hidden', 'true');
  });

  test('renders with translations', async () => {
    const searchClient = createMockedSearchClient();
    const { getByRole } = render(
      <InstantSearchTestWrapper
        searchClient={searchClient}
        initialUiState={{ indexName: { page: 10 } }}
      >
        <InfiniteHits
          translations={{
            showMoreButtonText: 'Display more',
            showPreviousButtonText: 'Display previous',
          }}
        />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));

    expect(getByRole('button', { name: 'Display more' })).toBeInTheDocument();
    expect(
      getByRole('button', { name: 'Display previous' })
    ).toBeInTheDocument();
  });
});
