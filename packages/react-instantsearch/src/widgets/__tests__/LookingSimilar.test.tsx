/**
 * @jest-environment jsdom
 */

import { createRecommendSearchClient } from '@instantsearch/mocks/fixtures';
import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import React from 'react';

import { Carousel } from '../../templates/Carousel';
import { LookingSimilar } from '../LookingSimilar';

describe('LookingSimilar', () => {
  test('renders with translations', async () => {
    const client = createRecommendSearchClient({
      minimal: true,
    });
    const { container } = render(
      <InstantSearchTestWrapper searchClient={client}>
        <LookingSimilar objectIDs={['1']} translations={{ title: 'My FBT' }} />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => {
      expect(client.getRecommendations).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(container.querySelector('.ais-LookingSimilar'))
        .toMatchInlineSnapshot(`
        <section
          class="ais-LookingSimilar"
        >
          <h3
            class="ais-LookingSimilar-title"
          >
            My FBT
          </h3>
          <div
            class="ais-LookingSimilar-container"
          >
            <ol
              class="ais-LookingSimilar-list"
            >
              <li
                class="ais-LookingSimilar-item"
              >
                {
          "objectID": "1"
        }
              </li>
              <li
                class="ais-LookingSimilar-item"
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
        <LookingSimilar
          objectIDs={['1']}
          className="MyLookingSimilar"
          classNames={{ root: 'ROOT' }}
          aria-hidden={true}
        />
      </InstantSearchTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyLookingSimilar', 'ROOT');
    expect(root).toHaveAttribute('aria-hidden', 'true');
  });

  test('renders custom layout component', async () => {
    const client = createRecommendSearchClient({
      minimal: true,
    });
    const { container } = render(
      <InstantSearchTestWrapper searchClient={client}>
        <LookingSimilar
          objectIDs={['1']}
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
      expect(container.querySelector('.ais-LookingSimilar'))
        .toMatchInlineSnapshot(`
        <section
          class="ais-LookingSimilar"
        >
          <h3
            class="ais-LookingSimilar-title"
          >
            Looking similar
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
        <LookingSimilar
          objectIDs={['1']}
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
      expect(container.querySelector('.ais-LookingSimilar'))
        .toMatchInlineSnapshot(`
        <section
          class="ais-LookingSimilar"
        >
          <h3
            class="ais-LookingSimilar-title"
          >
            Looking similar
          </h3>
          <div
            class="ais-Carousel ais-LookingSimilar"
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
              class="ais-Carousel-list ais-LookingSimilar-list"
              id="ais-Carousel-0"
              tabindex="0"
            >
              <li
                aria-label="1 of 2"
                aria-roledescription="slide"
                class="ais-Carousel-item ais-LookingSimilar-item"
              >
                <p>
                  1
                </p>
              </li>
              <li
                aria-label="2 of 2"
                aria-roledescription="slide"
                class="ais-Carousel-item ais-LookingSimilar-item"
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
