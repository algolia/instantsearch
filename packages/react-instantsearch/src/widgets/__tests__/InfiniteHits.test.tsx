/**
 * @jest-environment jsdom
 */

import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import React from 'react';

import { InfiniteHits } from '../InfiniteHits';

import type { MockSearchClient } from '@instantsearch/mocks';
import type { AlgoliaHit } from 'instantsearch.js';

type CustomHit = { somethingSpecial: string };

const bannerWidgetRenderingContent = {
  widgets: {
    banners: [
      {
        image: {
          urls: [{ url: 'https://via.placeholder.com/550x250' }],
        },
        link: {
          url: 'https://www.algolia.com',
        },
      },
    ],
  },
};

function getSearchClient(withBannerWidget = false) {
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

              return createSingleSearchResponse<AlgoliaHit<CustomHit>>({
                hits,
                page,
                nbPages: 10,
                hitsPerPage,
                index: request.indexName,
                // @TODO: remove once algoliasearch js client has been updated
                // @ts-expect-error
                renderingContent: withBannerWidget
                  ? bannerWidgetRenderingContent
                  : undefined,
              });
            }
          )
        )
      )
    ) as MockSearchClient['search'],
  });
}

describe('InfiniteHits', () => {
  test('renders the "Show Previous" button by default', async () => {
    const searchClient = getSearchClient();
    const { container } = render(
      <InstantSearchTestWrapper
        searchClient={searchClient}
        initialUiState={{ indexName: { page: 4 } }}
      >
        <InfiniteHits<CustomHit> />
      </InstantSearchTestWrapper>
    );

    await waitFor(() =>
      expect(container.querySelectorAll('.ais-InfiniteHits-item')).toHaveLength(
        3
      )
    );

    expect(
      document.querySelector('.ais-InfiniteHits-loadPrevious')
    ).toBeInTheDocument();
  });

  test('renders with a custom hit component', async () => {
    const searchClient = getSearchClient();
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

  test('forwards custom class names and `div` props to the root element', () => {
    const searchClient = getSearchClient();
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
    const searchClient = getSearchClient();
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

  describe('banner', () => {
    test('renders a banner', async () => {
      const searchClient = getSearchClient(true);
      const { container } = render(
        <InstantSearchTestWrapper searchClient={searchClient}>
          <InfiniteHits />
        </InstantSearchTestWrapper>
      );

      await waitFor(() => {
        expect(container.querySelectorAll('img')).toHaveLength(1);
        expect(container.querySelectorAll('a')).toHaveLength(1);
        expect(container.querySelector('.ais-Hits')).toMatchInlineSnapshot(
          `null`
        );
      });
    });

    test('does not render a banner when "bannerComponent" is set to false', async () => {
      const searchClient = getSearchClient(true);
      const { container } = render(
        <InstantSearchTestWrapper searchClient={searchClient}>
          <InfiniteHits bannerComponent={false} />
        </InstantSearchTestWrapper>
      );

      await waitFor(() => {
        expect(container.querySelectorAll('img')).toHaveLength(0);
        expect(container.querySelectorAll('a')).toHaveLength(0);
        expect(container.querySelector('.ais-InfiniteHits'))
          .toMatchInlineSnapshot(`
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
        `);
      });
    });

    test('renders custom banner component', async () => {
      const searchClient = getSearchClient(true);
      const { container } = render(
        <InstantSearchTestWrapper searchClient={searchClient}>
          <InfiniteHits
            bannerComponent={({ banner }) => (
              <img src={banner.image.urls[0].url} />
            )}
          />
        </InstantSearchTestWrapper>
      );

      await waitFor(() => {
        expect(container.querySelectorAll('img')).toHaveLength(1);
        expect(container.querySelector('.ais-InfiniteHits'))
          .toMatchInlineSnapshot(`
          <div
            class="ais-InfiniteHits"
          >
            <button
              class="ais-InfiniteHits-loadPrevious ais-InfiniteHits-loadPrevious--disabled"
              disabled=""
            >
              Show previous results
            </button>
            <img
              src="https://via.placeholder.com/550x250"
            />
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
    });
  });
});
