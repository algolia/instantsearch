/**
 * @jest-environment jsdom
 */

import { createRecommendSearchClient } from '@instantsearch/mocks/fixtures';
import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import React from 'react';

import { Carousel } from '../../components/Carousel';
import { TrendingItems } from '../TrendingItems';

describe('TrendingItems', () => {
  test('renders with translations', async () => {
    const client = createRecommendSearchClient({
      minimal: true,
    });
    const { container } = render(
      <InstantSearchTestWrapper searchClient={client}>
        <TrendingItems translations={{ title: 'My trending items' }} />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => {
      expect(client.getRecommendations).toHaveBeenCalledTimes(1);
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

  test('renders custom layout component', async () => {
    const client = createRecommendSearchClient({
      minimal: true,
    });
    const { container } = render(
      <InstantSearchTestWrapper searchClient={client}>
        <TrendingItems
          layoutComponent={({ items }) => (
            <ul>
              {items.map((item) => (
                <li key={item.objectID}>
                  <p>{item.objectID}</p>
                </li>
              ))}
            </ul>
          )}
        />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => {
      expect(client.getRecommendations).toHaveBeenCalledTimes(1);
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
            Trending items
          </h3>
          <ul>
            <li>
              <p>
                1
              </p>
            </li>
            <li>
              <p>
                2
              </p>
            </li>
          </ul>
        </section>
        `);
    });
  });

  test('renders Carousel as a layout component', async () => {
    const client = createRecommendSearchClient({
      minimal: true,
    });
    const { container } = render(
      <InstantSearchTestWrapper searchClient={client}>
        <TrendingItems
          itemComponent={({ item }) => <p>{item.objectID}</p>}
          layoutComponent={(props) => (
            <Carousel
              {...props}
              previousIconComponent={() => <p>Previous</p>}
              nextIconComponent={() => <p>Next</p>}
            />
          )}
        />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => {
      expect(client.getRecommendations).toHaveBeenCalledTimes(1);
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
            Trending items
          </h3>
          <div
            class="ais-Carousel ais-TrendingItems"
          >
            <button
              aria-controls="ais-Carousel-0"
              aria-label="Previous"
              class="ais-Carousel-navigation ais-Carousel-navigation--previous"
              hidden=""
              title="Previous"
            >
              <p>
                Previous
              </p>
            </button>
            <ol
              aria-label="Items"
              aria-live="polite"
              aria-roledescription="carousel"
              class="ais-Carousel-list ais-TrendingItems-list"
              id="ais-Carousel-0"
              tabindex="0"
            >
              <li
                aria-label="1 of 2"
                aria-roledescription="slide"
                class="ais-Carousel-item ais-TrendingItems-item"
              >
                <p>
                  1
                </p>
              </li>
              <li
                aria-label="2 of 2"
                aria-roledescription="slide"
                class="ais-Carousel-item ais-TrendingItems-item"
              >
                <p>
                  2
                </p>
              </li>
            </ol>
            <button
              aria-controls="ais-Carousel-0"
              aria-label="Next"
              class="ais-Carousel-navigation ais-Carousel-navigation--next"
              title="Next"
            >
              <p>
                Next
              </p>
            </button>
          </div>
        </section>
        `);
    });
  });
});
