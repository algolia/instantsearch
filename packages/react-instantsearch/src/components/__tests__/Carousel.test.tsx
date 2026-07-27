/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { fireEvent, render, waitFor } from '@testing-library/react';
import React, { useState } from 'react';

import { Carousel } from '../Carousel';

describe('Carousel', () => {
  test('renders with default props', () => {
    const { container } = render(
      <Carousel
        sendEvent={jest.fn()}
        items={[
          { objectID: '1', __position: 1 },
          { objectID: '2', __position: 2 },
        ]}
        itemComponent={({ item }) => <p>{item.objectID}</p>}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Carousel"
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
            class="ais-Carousel-list"
            id="ais-Carousel-0"
            tabindex="0"
          >
            <li
              aria-label="1 of 2"
              aria-roledescription="slide"
              class="ais-Carousel-item"
            >
              <p>
                1
              </p>
            </li>
            <li
              aria-label="2 of 2"
              aria-roledescription="slide"
              class="ais-Carousel-item"
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
      </div>
    `);
  });

  test('adds custom class names', () => {
    const { container } = render(
      <Carousel
        sendEvent={jest.fn()}
        items={[
          { objectID: '1', __position: 1 },
          { objectID: '2', __position: 2 },
        ]}
        itemComponent={({ item }) => <p>{item.objectID}</p>}
        classNames={{
          root: 'ROOT',
          list: 'LIST',
          item: 'ITEM',
          navigation: 'NAVIGATION',
          navigationPrevious: 'NAVIGATION_PREVIOUS',
          navigationNext: 'NAVIGATION_NEXT',
        }}
      />
    );

    expect(container.querySelector('.ais-Carousel')).toHaveClass('ROOT');
    expect(container.querySelector('.ais-Carousel-list')).toHaveClass('LIST');
    expect(container.querySelector('.ais-Carousel-item')).toHaveClass('ITEM');
    expect(container.querySelector('.ais-Carousel-navigation')).toHaveClass(
      'NAVIGATION'
    );
    expect(
      container.querySelector('.ais-Carousel-navigation--previous')
    ).toHaveClass('NAVIGATION_PREVIOUS');
    expect(
      container.querySelector('.ais-Carousel-navigation--next')
    ).toHaveClass('NAVIGATION_NEXT');
  });

  test('adds custom icon components', () => {
    const { container } = render(
      <Carousel
        sendEvent={jest.fn()}
        items={[
          { objectID: '1', __position: 1 },
          { objectID: '2', __position: 2 },
        ]}
        itemComponent={({ item }) => <p>{item.objectID}</p>}
        previousIconComponent={() => <p>Previous</p>}
        nextIconComponent={() => <p>Next</p>}
      />
    );

    expect(container).toMatchInlineSnapshot(`
          <div>
            <div
              class="ais-Carousel"
            >
              <button
                aria-controls="ais-Carousel-2"
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
                class="ais-Carousel-list"
                id="ais-Carousel-2"
                tabindex="0"
              >
                <li
                  aria-label="1 of 2"
                  aria-roledescription="slide"
                  class="ais-Carousel-item"
                >
                  <p>
                    1
                  </p>
                </li>
                <li
                  aria-label="2 of 2"
                  aria-roledescription="slide"
                  class="ais-Carousel-item"
                >
                  <p>
                    2
                  </p>
                </li>
              </ol>
              <button
                aria-controls="ais-Carousel-2"
                aria-label="Next"
                class="ais-Carousel-navigation ais-Carousel-navigation--next"
                title="Next"
              >
                <p>
                  Next
                </p>
              </button>
            </div>
          </div>
        `);
  });

  test('adds custom translations', () => {
    const { container } = render(
      <Carousel
        sendEvent={jest.fn()}
        items={[
          { objectID: '1', __position: 1 },
          { objectID: '2', __position: 2 },
        ]}
        itemComponent={({ item }) => <p>{item.objectID}</p>}
        translations={{
          nextButtonLabel: 'Next button label',
          nextButtonTitle: 'Next button title',
          previousButtonLabel: 'Previous button label',
          previousButtonTitle: 'Previous button title',
          listLabel: 'List label',
        }}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Carousel"
        >
          <button
            aria-controls="ais-Carousel-3"
            aria-label="Previous button label"
            class="ais-Carousel-navigation ais-Carousel-navigation--previous"
            hidden=""
            title="Previous button title"
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
            aria-label="List label"
            aria-live="polite"
            aria-roledescription="carousel"
            class="ais-Carousel-list"
            id="ais-Carousel-3"
            tabindex="0"
          >
            <li
              aria-label="1 of 2"
              aria-roledescription="slide"
              class="ais-Carousel-item"
            >
              <p>
                1
              </p>
            </li>
            <li
              aria-label="2 of 2"
              aria-roledescription="slide"
              class="ais-Carousel-item"
            >
              <p>
                2
              </p>
            </li>
          </ol>
          <button
            aria-controls="ais-Carousel-3"
            aria-label="Next button label"
            class="ais-Carousel-navigation ais-Carousel-navigation--next"
            title="Next button title"
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
      </div>
    `);
  });

  test('preserves duplicate item state when another item is prepended', () => {
    function StatefulItem({
      item,
    }: {
      item: { objectID: string; __position: number; name: string };
    }) {
      const [selected, setSelected] = useState(false);

      return (
        <button
          aria-label={`Toggle ${item.name}`}
          onClick={() => setSelected((value) => !value)}
        >
          {item.name}: {selected ? 'selected' : 'idle'}
        </button>
      );
    }

    const items = [
      { objectID: '1', __position: 1, name: 'shoe' },
      { objectID: '1', __position: 2, name: 'sock' },
      { objectID: '2', __position: 3, name: 'hat' },
    ];
    const { getByRole, getAllByRole, rerender } = render(
      <Carousel
        sendEvent={jest.fn()}
        items={items}
        itemComponent={StatefulItem}
      />
    );

    fireEvent.click(getByRole('button', { name: 'Toggle sock' }));
    expect(getByRole('button', { name: 'Toggle sock' })).toHaveTextContent(
      'sock: selected'
    );

    rerender(
      <Carousel
        sendEvent={jest.fn()}
        items={[
          { objectID: '9', __position: 1, name: 'new' },
          ...items.map((item, index) => ({
            ...item,
            __position: index + 2,
          })),
        ]}
        itemComponent={StatefulItem}
      />
    );

    expect(getAllByRole('listitem')).toHaveLength(4);
    expect(getByRole('button', { name: 'Toggle shoe' })).toHaveTextContent(
      'shoe: idle'
    );
    expect(getByRole('button', { name: 'Toggle sock' })).toHaveTextContent(
      'sock: selected'
    );
  });

  test('updates navigation when items are appended', async () => {
    function Header({ canScrollRight }: { canScrollRight: boolean }) {
      return (
        <button aria-label="Next results" disabled={!canScrollRight}>
          Next
        </button>
      );
    }

    const items = [
      { objectID: '1', __position: 1 },
      { objectID: '2', __position: 2 },
    ];
    const { container, getByRole, rerender } = render(
      <Carousel
        sendEvent={jest.fn()}
        items={items}
        itemComponent={({ item }) => <p>{item.objectID}</p>}
        headerComponent={Header}
      />
    );
    const list = container.querySelector('.ais-Carousel-list')!;
    let scrollWidth = 200;

    Object.defineProperties(list, {
      clientWidth: { configurable: true, value: 100 },
      scrollWidth: {
        configurable: true,
        get: () => scrollWidth,
      },
    });
    list.scrollLeft = 100;
    fireEvent.scroll(list);

    await waitFor(() =>
      expect(getByRole('button', { name: 'Next results' })).toBeDisabled()
    );

    scrollWidth = 300;
    rerender(
      <Carousel
        sendEvent={jest.fn()}
        items={[...items, { objectID: '3', __position: 3 }]}
        itemComponent={({ item }) => <p>{item.objectID}</p>}
        headerComponent={Header}
      />
    );

    await waitFor(() =>
      expect(getByRole('button', { name: 'Next results' })).toBeEnabled()
    );
  });

  test('wires the navigation measurement when items arrive after mount', async () => {
    type Item = { objectID: string; __position: number };
    const items: Array<Item> = [
      { objectID: '1', __position: 1 },
      { objectID: '2', __position: 2 },
    ];
    const noItems: Array<Item> = [];
    const { container, rerender } = render(
      <Carousel
        sendEvent={jest.fn()}
        items={noItems}
        itemComponent={({ item }) => <p>{item.objectID}</p>}
      />
    );

    expect(container.querySelector('.ais-Carousel')).toBeNull();

    rerender(
      <Carousel
        sendEvent={jest.fn()}
        items={items}
        itemComponent={({ item }) => <p>{item.objectID}</p>}
      />
    );

    // Only proves the flavor state wiring reaches the shared measurement. The
    // fitting and overflowing decisions are covered in the shared Carousel suite,
    // which sets explicit widths.
    await waitFor(() =>
      expect(
        container.querySelector<HTMLButtonElement>(
          '.ais-Carousel-navigation--next'
        )
      ).not.toBeVisible()
    );
  });
});
