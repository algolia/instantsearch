/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { render } from '@testing-library/react';
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
});
