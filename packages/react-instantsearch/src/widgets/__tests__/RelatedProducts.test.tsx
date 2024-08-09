/**
 * @jest-environment jsdom
 */

import { createRecommendSearchClient } from '@instantsearch/mocks/fixtures';
import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import React from 'react';

import { Carousel } from '../../components/Carousel';
import { RelatedProducts } from '../RelatedProducts';

describe('RelatedProducts', () => {
  test('renders with translations', async () => {
    const client = createRecommendSearchClient({
      minimal: true,
    });
    const { container } = render(
      <InstantSearchTestWrapper searchClient={client}>
        <RelatedProducts
          objectIDs={['1']}
          translations={{ title: 'My related products' }}
        />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => {
      expect(client.getRecommendations).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(container.querySelector('.ais-RelatedProducts'))
        .toMatchInlineSnapshot(`
        <section
          class="ais-RelatedProducts"
        >
          <h3
            class="ais-RelatedProducts-title"
          >
            My related products
          </h3>
          <div
            class="ais-RelatedProducts-container"
          >
            <ol
              class="ais-RelatedProducts-list"
            >
              <li
                class="ais-RelatedProducts-item"
              >
                {
          "objectID": "1"
        }
              </li>
              <li
                class="ais-RelatedProducts-item"
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
        <RelatedProducts
          objectIDs={['1']}
          className="MyRelatedProducts"
          classNames={{ root: 'ROOT' }}
          aria-hidden={true}
        />
      </InstantSearchTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyRelatedProducts', 'ROOT');
    expect(root).toHaveAttribute('aria-hidden', 'true');
  });

  test('renders with a custom layout', async () => {
    const client = createRecommendSearchClient({
      minimal: true,
    });

    const { container } = render(
      <InstantSearchTestWrapper searchClient={client}>
        <RelatedProducts
          objectIDs={['1']}
          layoutComponent={({ items }) => {
            return (
              <ul>
                {items.map((item) => (
                  <li key={item.objectID}>
                    <p>{item.objectID}</p>
                  </li>
                ))}
              </ul>
            );
          }}
        />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => {
      expect(client.getRecommendations).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(container.querySelector('.ais-RelatedProducts'))
        .toMatchInlineSnapshot(`
        <section
          class="ais-RelatedProducts"
        >
          <h3
            class="ais-RelatedProducts-title"
          >
            Related products
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

  test('renders with Carousel layout', async () => {
    const client = createRecommendSearchClient({
      minimal: true,
    });

    const { container } = render(
      <InstantSearchTestWrapper searchClient={client}>
        <RelatedProducts
          objectIDs={['1']}
          itemComponent={({ item }) => <p>{item.objectID}</p>}
          layoutComponent={(props) => {
            return (
              <Carousel
                {...props}
                previousIconComponent={() => <p>Previous</p>}
                nextIconComponent={() => <p>Next</p>}
                classNames={{
                  root: 'ROOT',
                  list: 'LIST',
                  item: 'ITEM',
                  navigation: 'NAVIGATION',
                  navigationNext: 'NAVIGATION_NEXT',
                  navigationPrevious: 'NAVIGATION_PREVIOUS',
                }}
                translations={{
                  nextButtonLabel: 'NEXT_BUTTON_LABEL',
                  nextButtonTitle: 'NEXT_BUTTON_TITLE',
                  previousButtonLabel: 'PREVIOUS_BUTTON_LABEL',
                  previousButtonTitle: 'PREVIOUS_BUTTON_TITLE',
                  listLabel: 'LIST_LABEL',
                }}
              />
            );
          }}
        />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => {
      expect(client.getRecommendations).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(container.querySelector('.ais-RelatedProducts'))
        .toMatchInlineSnapshot(`
        <section
          class="ais-RelatedProducts"
        >
          <h3
            class="ais-RelatedProducts-title"
          >
            Related products
          </h3>
          <div
            class="ais-Carousel ROOT"
          >
            <button
              aria-controls="ais-Carousel-0"
              aria-label="PREVIOUS_BUTTON_LABEL"
              class="ais-Carousel-navigation NAVIGATION ais-Carousel-navigation--previous NAVIGATION_PREVIOUS"
              hidden=""
              title="PREVIOUS_BUTTON_TITLE"
            >
              <p>
                Previous
              </p>
            </button>
            <ol
              aria-label="LIST_LABEL"
              aria-live="polite"
              aria-roledescription="carousel"
              class="ais-Carousel-list LIST"
              id="ais-Carousel-0"
              tabindex="0"
            >
              <li
                aria-label="1 of 2"
                aria-roledescription="slide"
                class="ais-Carousel-item ITEM"
              >
                <p>
                  1
                </p>
              </li>
              <li
                aria-label="2 of 2"
                aria-roledescription="slide"
                class="ais-Carousel-item ITEM"
              >
                <p>
                  2
                </p>
              </li>
            </ol>
            <button
              aria-controls="ais-Carousel-0"
              aria-label="NEXT_BUTTON_LABEL"
              class="ais-Carousel-navigation NAVIGATION ais-Carousel-navigation--next NAVIGATION_NEXT"
              title="NEXT_BUTTON_TITLE"
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
