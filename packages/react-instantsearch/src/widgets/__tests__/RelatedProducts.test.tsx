/**
 * @jest-environment jsdom
 */

import { createRecommendSearchClient } from '@instantsearch/mocks/fixtures';
import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import { cx } from 'instantsearch-ui-components';
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

  test('renders Carousel as a layout component', async () => {
    const client = createRecommendSearchClient({
      minimal: true,
    });
    const { container } = render(
      <InstantSearchTestWrapper searchClient={client}>
        <RelatedProducts
          objectIDs={['1']}
          itemComponent={({ item }) => <p>{item.objectID}</p>}
          layoutComponent={Carousel}
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
            class="ais-Carousel ais-RelatedProducts"
          >
            <button
              aria-controls="ais-Carousel-0"
              aria-label="Previous"
              class="ais-Carousel-navigation ais-Carousel-navigation--previous"
              hidden=""
              title="Previous"
            >
              <svg
                fill="none"
                height="16"
                viewBox="0 0 8 16"
                width="8"
              >
                <path
                  clip-rule="evenodd"
                  d="M7.13809 0.744078C7.39844 1.06951 7.39844 1.59715 7.13809 1.92259L2.27616 8L7.13809 14.0774C7.39844 14.4028 7.39844 14.9305 7.13809 15.2559C6.87774 15.5814 6.45563 15.5814 6.19528 15.2559L0.861949 8.58926C0.6016 8.26382 0.6016 7.73618 0.861949 7.41074L6.19528 0.744078C6.45563 0.418641 6.87774 0.418641 7.13809 0.744078Z"
                  fill="currentColor"
                  fill-rule="evenodd"
                />
              </svg>
            </button>
            <ol
              aria-label="Items"
              aria-live="polite"
              aria-roledescription="carousel"
              class="ais-Carousel-list ais-RelatedProducts-list"
              id="ais-Carousel-0"
              tabindex="0"
            >
              <li
                aria-label="1 of 2"
                aria-roledescription="slide"
                class="ais-Carousel-item ais-RelatedProducts-item"
              >
                <p>
                  1
                </p>
              </li>
              <li
                aria-label="2 of 2"
                aria-roledescription="slide"
                class="ais-Carousel-item ais-RelatedProducts-item"
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
              <svg
                fill="none"
                height="16"
                viewBox="0 0 8 16"
                width="8"
              >
                <path
                  clip-rule="evenodd"
                  d="M0.861908 15.2559C0.601559 14.9305 0.601559 14.4028 0.861908 14.0774L5.72384 8L0.861908 1.92259C0.601559 1.59715 0.601559 1.06952 0.861908 0.744079C1.12226 0.418642 1.54437 0.418642 1.80472 0.744079L7.13805 7.41074C7.3984 7.73618 7.3984 8.26382 7.13805 8.58926L1.80472 15.2559C1.54437 15.5814 1.12226 15.5814 0.861908 15.2559Z"
                  fill="currentColor"
                  fill-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </section>
        `);
    });
  });

  test('renders Carousel with custom props as a layout component', async () => {
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
                  root: cx('ROOT', props.classNames.root),
                  list: cx('LIST', props.classNames.list),
                  item: cx('ITEM', props.classNames.item),
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
            class="ais-Carousel ROOT ais-RelatedProducts"
          >
            <button
              aria-controls="ais-Carousel-1"
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
              class="ais-Carousel-list LIST ais-RelatedProducts-list"
              id="ais-Carousel-1"
              tabindex="0"
            >
              <li
                aria-label="1 of 2"
                aria-roledescription="slide"
                class="ais-Carousel-item ITEM ais-RelatedProducts-item"
              >
                <p>
                  1
                </p>
              </li>
              <li
                aria-label="2 of 2"
                aria-roledescription="slide"
                class="ais-Carousel-item ITEM ais-RelatedProducts-item"
              >
                <p>
                  2
                </p>
              </li>
            </ol>
            <button
              aria-controls="ais-Carousel-1"
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
