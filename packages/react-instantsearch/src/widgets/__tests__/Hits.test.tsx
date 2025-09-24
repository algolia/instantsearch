/**
 * @jest-environment jsdom @instantsearch/testutils/jest-environment-jsdom.ts
 */

import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import React from 'react';

import { Hits } from '../Hits';

import type { MockSearchClient } from '@instantsearch/mocks';
import type { AlgoliaHit } from 'instantsearch.js';

type CustomRecord = {
  somethingSpecial: string;
};

const hits = [
  { objectID: '1', somethingSpecial: 'a' },
  { objectID: '2', somethingSpecial: 'b' },
  { objectID: '3', somethingSpecial: 'c' },
];

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
            (request: Parameters<MockSearchClient['search']>[0][number]) =>
              createSingleSearchResponse<AlgoliaHit<CustomRecord>>({
                hits,
                index: request.indexName,
                // @TODO: remove once algoliasearch js client has been updated
                // @ts-expect-error
                renderingContent: withBannerWidget
                  ? bannerWidgetRenderingContent
                  : undefined,
              })
          )
        )
      )
    ) as MockSearchClient['search'],
  });
}

describe('Hits', () => {
  test('renders with a custom hit component', async () => {
    const searchClient = getSearchClient();

    const { container } = render(
      <InstantSearchTestWrapper searchClient={searchClient}>
        <Hits<CustomRecord>
          hitComponent={({ hit }) => (
            <strong>{`${hit.__position} - ${hit.somethingSpecial}`}</strong>
          )}
        />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => {
      expect(container.querySelectorAll('strong')).toHaveLength(3);
      expect(container.querySelector('.ais-Hits')).toMatchInlineSnapshot(`
        <div
          class="ais-Hits"
        >
          <ol
            class="ais-Hits-list"
          >
            <li
              class="ais-Hits-item"
            >
              <strong>
                1 - a
              </strong>
            </li>
            <li
              class="ais-Hits-item"
            >
              <strong>
                2 - b
              </strong>
            </li>
            <li
              class="ais-Hits-item"
            >
              <strong>
                3 - c
              </strong>
            </li>
          </ol>
        </div>
      `);
    });
  });

  test('custom hit component should not remount on rerender', async () => {
    const searchClient = getSearchClient();

    const mounted = jest.fn();

    const CustomHit = () => {
      React.useEffect(() => {
        mounted();
      }, []);

      return null;
    };

    const { container, rerender } = render(
      <InstantSearchTestWrapper searchClient={searchClient}>
        <Hits hitComponent={CustomHit} />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => {
      expect(container.querySelectorAll('li')).toHaveLength(3);
      expect(mounted).toHaveBeenCalledTimes(3);
    });

    rerender(
      <InstantSearchTestWrapper searchClient={searchClient}>
        <Hits hitComponent={CustomHit} />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => {
      expect(container.querySelectorAll('li')).toHaveLength(3);
      expect(mounted).toHaveBeenCalledTimes(3);
    });
  });

  test('forwards custom class names and `div` props to the root element', () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <Hits
          className="MyHits"
          classNames={{ root: 'ROOT' }}
          aria-hidden={true}
        />
      </InstantSearchTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyHits', 'ROOT');
    expect(root).toHaveAttribute('aria-hidden', 'true');
  });

  describe('banner', () => {
    test('renders a banner', async () => {
      const searchClient = getSearchClient(true);

      const { container } = render(
        <InstantSearchTestWrapper searchClient={searchClient}>
          <Hits<CustomRecord> />
        </InstantSearchTestWrapper>
      );

      await waitFor(() => {
        expect(container.querySelectorAll('img')).toHaveLength(1);
        expect(container.querySelectorAll('a')).toHaveLength(1);
        expect(container.querySelector('.ais-Hits')).toMatchInlineSnapshot(`
          <div
            class="ais-Hits"
          >
            <aside
              class="ais-Hits-banner"
            >
              <a
                class="ais-Hits-banner-link"
                href="https://www.algolia.com"
              >
                <img
                  class="ais-Hits-banner-image"
                  src="https://via.placeholder.com/550x250"
                />
              </a>
            </aside>
            <ol
              class="ais-Hits-list"
            >
              <li
                class="ais-Hits-item"
              >
                <div
                  style="word-break: break-all;"
                >
                  {"objectID":"1","somethingSpecial":"a","__position":1}
                  …
                </div>
              </li>
              <li
                class="ais-Hits-item"
              >
                <div
                  style="word-break: break-all;"
                >
                  {"objectID":"2","somethingSpecial":"b","__position":2}
                  …
                </div>
              </li>
              <li
                class="ais-Hits-item"
              >
                <div
                  style="word-break: break-all;"
                >
                  {"objectID":"3","somethingSpecial":"c","__position":3}
                  …
                </div>
              </li>
            </ol>
          </div>
        `);
      });
    });

    test('does not render a banner when "bannerComponent" is set to `false`', async () => {
      const searchClient = getSearchClient(true);

      const { container } = render(
        <InstantSearchTestWrapper searchClient={searchClient}>
          <Hits<CustomRecord> bannerComponent={false} />
        </InstantSearchTestWrapper>
      );

      await waitFor(() => {
        expect(container.querySelectorAll('img')).toHaveLength(0);
        expect(container.querySelector('.ais-Hits')).toMatchInlineSnapshot(`
          <div
            class="ais-Hits ais-Hits--empty"
          >
            <ol
              class="ais-Hits-list"
            />
          </div>
        `);
      });
    });

    test('renders custom banner component', async () => {
      const searchClient = getSearchClient(true);

      const { container } = render(
        <InstantSearchTestWrapper searchClient={searchClient}>
          <Hits<CustomRecord>
            bannerComponent={({ banner }) => (
              <img src={banner.image.urls[0].url} />
            )}
          />
        </InstantSearchTestWrapper>
      );

      await waitFor(() => {
        expect(container.querySelectorAll('img')).toHaveLength(1);
        expect(container.querySelector('.ais-Hits')).toMatchInlineSnapshot(`
          <div
            class="ais-Hits"
          >
            <img
              src="https://via.placeholder.com/550x250"
            />
            <ol
              class="ais-Hits-list"
            >
              <li
                class="ais-Hits-item"
              >
                <div
                  style="word-break: break-all;"
                >
                  {"objectID":"1","somethingSpecial":"a","__position":1}
                  …
                </div>
              </li>
              <li
                class="ais-Hits-item"
              >
                <div
                  style="word-break: break-all;"
                >
                  {"objectID":"2","somethingSpecial":"b","__position":2}
                  …
                </div>
              </li>
              <li
                class="ais-Hits-item"
              >
                <div
                  style="word-break: break-all;"
                >
                  {"objectID":"3","somethingSpecial":"c","__position":3}
                  …
                </div>
              </li>
            </ol>
          </div>
        `);
      });
    });
  });
});
