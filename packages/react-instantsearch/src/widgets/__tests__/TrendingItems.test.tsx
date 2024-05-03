/**
 * @jest-environment jsdom
 */

import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import React from 'react';

import { TrendingItems } from '../TrendingItems';

import type { SearchClient } from 'instantsearch.js';

describe('TrendingItems', () => {
  test('renders with translations', async () => {
    const client = createMockedSearchClient();
    const { container } = render(
      <InstantSearchTestWrapper searchClient={client}>
        <TrendingItems translations={{ title: 'My trending items' }} />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => {
      expect(client.search).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(container.querySelector('.ais-TrendingItems'))
        .toMatchInlineSnapshot(`
        <section
          class="ais-TrendingItems"
        >
          <h3
            class="ais-TrendingItems-title"
          >
            My trending items
          </h3>
          <div
            class="ais-TrendingItems-container"
          >
            <ol
              class="ais-TrendingItems-list"
            >
              <li
                class="ais-TrendingItems-item"
              >
                {
          "objectID": "1"
        }
              </li>
              <li
                class="ais-TrendingItems-item"
              >
                {
          "objectID": "2"
        }
              </li>
            </ol>
          </div>
        </section>
      `);
    });
  });

  test('forwards custom class names and `div` props to the root element', () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <TrendingItems
          className="MyTrendingItems"
          classNames={{ root: 'ROOT' }}
          aria-hidden={true}
        />
      </InstantSearchTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyTrendingItems', 'ROOT');
    expect(root).toHaveAttribute('aria-hidden', 'true');
  });
});

function createMockedSearchClient() {
  return createSearchClient({
    getRecommendations: jest.fn((requests) =>
      Promise.resolve(
        createMultiSearchResponse(
          // @ts-ignore
          // `request` will be implicitly typed as `any` in type-check:v3
          // since `getRecommendations` is not available there
          ...requests.map((request) => {
            return createSingleSearchResponse<any>({
              hits:
                request.maxRecommendations === 0
                  ? []
                  : [{ objectID: '1' }, { objectID: '2' }],
            });
          })
        )
      )
    ) as SearchClient['getRecommendations'],
  });
}
