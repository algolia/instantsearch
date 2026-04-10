/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import {
  createRecommendResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks/createAPIResponse';
import { createSearchClient } from '@instantsearch/mocks/createSearchClient';
import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import React from 'react';

import { TrendingFacets } from '../TrendingFacets';

const facetFixture = [
  { facetName: 'brand', facetValue: 'Apple', _score: 95 },
  { facetName: 'brand', facetValue: 'Samsung', _score: 87 },
];

function createTrendingFacetsSearchClient() {
  return createSearchClient({
    getRecommendations: jest.fn((requests) =>
      Promise.resolve(
        createRecommendResponse(
          requests.map((request: any) => {
            return createSingleSearchResponse({
              // @ts-expect-error trending facet items aren't Hit objects
              hits: facetFixture.slice(
                0,
                typeof request.maxRecommendations === 'number'
                  ? Math.min(request.maxRecommendations, facetFixture.length)
                  : facetFixture.length
              ),
            });
          })
        )
      )
    ),
  });
}

describe('TrendingFacets', () => {
  test('renders with translations', async () => {
    const client = createTrendingFacetsSearchClient();
    const { container } = render(
      <InstantSearchTestWrapper searchClient={client}>
        <TrendingFacets
          facetName="brand"
          translations={{ title: 'My trending facets' }}
        />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => {
      expect(client.getRecommendations).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(container.querySelector('.ais-TrendingFacets'))
        .toMatchInlineSnapshot(`
        <section
          class="ais-TrendingFacets"
        >
          <h3
            class="ais-TrendingFacets-title"
          >
            My trending facets
          </h3>
          <div
            class="ais-TrendingFacets-container"
          >
            <ol
              class="ais-TrendingFacets-list"
            >
              <li
                class="ais-TrendingFacets-item"
              >
                Apple
              </li>
              <li
                class="ais-TrendingFacets-item"
              >
                Samsung
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
        <TrendingFacets
          facetName="brand"
          className="MyTrendingFacets"
          classNames={{ root: 'ROOT' }}
          aria-hidden={true}
        />
      </InstantSearchTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyTrendingFacets', 'ROOT');
    expect(root).toHaveAttribute('aria-hidden', 'true');
  });

  test('renders custom item component', async () => {
    const client = createTrendingFacetsSearchClient();
    const { container } = render(
      <InstantSearchTestWrapper searchClient={client}>
        <TrendingFacets
          facetName="brand"
          itemComponent={({ item }) => (
            <div>
              {item.facetValue} ({item._score})
            </div>
          )}
        />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => {
      expect(client.getRecommendations).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(container.querySelector('.ais-TrendingFacets'))
        .toMatchInlineSnapshot(`
        <section
          class="ais-TrendingFacets"
        >
          <h3
            class="ais-TrendingFacets-title"
          >
            Trending
          </h3>
          <div
            class="ais-TrendingFacets-container"
          >
            <ol
              class="ais-TrendingFacets-list"
            >
              <li
                class="ais-TrendingFacets-item"
              >
                <div>
                  Apple
                   (
                  95
                  )
                </div>
              </li>
              <li
                class="ais-TrendingFacets-item"
              >
                <div>
                  Samsung
                   (
                  87
                  )
                </div>
              </li>
            </ol>
          </div>
        </section>
      `);
    });
  });
});
