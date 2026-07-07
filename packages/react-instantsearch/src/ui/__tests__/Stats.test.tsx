/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { act, render } from '@testing-library/react';
import React from 'react';

import { Stats } from '../Stats';

import type { StatsProps, StatsTranslationOptions } from '../Stats';

describe('Stats', () => {
  function createProps(props: Partial<StatsProps>): StatsProps {
    return {
      nbHits: 100,
      processingTimeMS: 10,
      areHitsSorted: false,
      nbSortedHits: 100,
      translations: {
        rootElementText: ({
          nbHits,
          processingTimeMS,
          nbSortedHits,
          areHitsSorted,
        }: StatsTranslationOptions) => {
          return areHitsSorted && nbHits !== nbSortedHits
            ? `${nbSortedHits!.toLocaleString()} relevant results sorted out of ${nbHits.toLocaleString()} found in ${processingTimeMS.toLocaleString()}ms`
            : `${nbHits.toLocaleString()} results found in ${processingTimeMS.toLocaleString()}ms`;
        },
      },
      ...props,
    };
  }
  test('renders with props', () => {
    const props = createProps({});
    const { container } = render(<Stats {...props} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Stats"
        >
          <span
            class="ais-Stats-text"
          >
            100 results found in 10ms
          </span>
          <span
            aria-atomic="true"
            aria-live="polite"
            class="ais-Stats-announcement"
            role="status"
            style="position: absolute; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; border: 0px;"
          />
        </div>
      </div>
    `);
  });

  test('accepts custom class names', () => {
    const props = createProps({});
    const { container } = render(
      <Stats
        className="MyCustomStats"
        classNames={{ root: 'ROOT' }}
        {...props}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Stats ROOT MyCustomStats"
        >
          <span
            class="ais-Stats-text"
          >
            100 results found in 10ms
          </span>
          <span
            aria-atomic="true"
            aria-live="polite"
            class="ais-Stats-announcement"
            role="status"
            style="position: absolute; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; border: 0px;"
          />
        </div>
      </div>
    `);
  });

  test('accepts custom class names (empty)', () => {
    const props = createProps({});
    const { container } = render(
      <Stats className="MyCustomStats" classNames={{}} {...props} />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Stats MyCustomStats"
        >
          <span
            class="ais-Stats-text"
          >
            100 results found in 10ms
          </span>
          <span
            aria-atomic="true"
            aria-live="polite"
            class="ais-Stats-announcement"
            role="status"
            style="position: absolute; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; border: 0px;"
          />
        </div>
      </div>
    `);
  });

  test('shows sorted message', () => {
    const props = createProps({ areHitsSorted: true, nbSortedHits: 50 });
    const { container } = render(<Stats {...props} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Stats"
        >
          <span
            class="ais-Stats-text"
          >
            50 relevant results sorted out of 100 found in 10ms
          </span>
          <span
            aria-atomic="true"
            aria-live="polite"
            class="ais-Stats-announcement"
            role="status"
            style="position: absolute; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; border: 0px;"
          />
        </div>
      </div>
    `);
  });

  test('doesnt show sorted message if nbHits is same as nbSortedHits', () => {
    const props = createProps({
      areHitsSorted: true,
      nbHits: 100,
      nbSortedHits: 100,
    });
    const { container } = render(
      <Stats className="MyCustomStats" classNames={{}} {...props} />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Stats MyCustomStats"
        >
          <span
            class="ais-Stats-text"
          >
            100 results found in 10ms
          </span>
          <span
            aria-atomic="true"
            aria-live="polite"
            class="ais-Stats-announcement"
            role="status"
            style="position: absolute; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; border: 0px;"
          />
        </div>
      </div>
    `);
  });

  test('forwards `div` props to the root element', () => {
    const props = createProps({ title: 'Some custom title' });
    const { container } = render(<Stats {...props} />);

    expect(container.querySelector('.ais-Stats')).toHaveAttribute(
      'title',
      'Some custom title'
    );
  });

  test('renders with translations', () => {
    const translationFn = ({ areHitsSorted }: StatsTranslationOptions) =>
      areHitsSorted ? 'Sorted' : 'Unsorted';
    let props = createProps({
      translations: { rootElementText: translationFn },
    });

    const { getByText, rerender } = render(<Stats {...props} />);

    expect(getByText('Unsorted')).toBeInTheDocument();

    props = createProps({
      areHitsSorted: true,
      nbSortedHits: 1,
      nbHits: 2,
      translations: { rootElementText: translationFn },
    });

    rerender(<Stats {...props} />);

    expect(getByText('Sorted')).toBeInTheDocument();
  });

  test('announces the trimmed count after a debounce when results change', () => {
    jest.useFakeTimers();

    try {
      const translations = {
        rootElementText: ({ nbHits }: StatsTranslationOptions) =>
          `${nbHits} results found`,
        announcementText: ({ nbHits }: StatsTranslationOptions) =>
          `${nbHits} results`,
      };

      const props = createProps({ nbHits: 100, translations });
      const { container, rerender } = render(<Stats {...props} />);

      const region = container.querySelector('.ais-Stats-announcement');

      // Initial results are not announced.
      expect(region).toBeEmptyDOMElement();

      rerender(<Stats {...createProps({ nbHits: 5, translations })} />);

      // Still empty before the debounce elapses.
      expect(region).toBeEmptyDOMElement();

      act(() => {
        jest.advanceTimersByTime(1400);
      });

      expect(region).toHaveTextContent('5 results');
    } finally {
      jest.useRealTimers();
    }
  });
});
