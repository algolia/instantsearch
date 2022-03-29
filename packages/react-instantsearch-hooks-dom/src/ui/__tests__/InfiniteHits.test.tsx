import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { InfiniteHits } from '../InfiniteHits';

import type { InfiniteHitsProps } from '../InfiniteHits';
import type { Hit } from 'instantsearch.js';

describe('InfiniteHits', () => {
  function createProps<THit extends Hit = Hit>(
    props: Partial<InfiniteHitsProps<THit>>
  ) {
    return {
      hits: [
        { objectID: 'abc', __position: 1 },
        { objectID: 'def', __position: 2 },
      ],
      isFirstPage: true,
      isLastPage: false,
      onShowPrevious: jest.fn(),
      onShowMore: jest.fn(),
      translations: {
        showPrevious: 'Show previous results',
        showMore: 'Show more results',
      },
      ...props,
    };
  }

  test('renders with default props', () => {
    const props = createProps({});

    const { container } = render(<InfiniteHits {...props} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-InfiniteHits"
        >
          <button
            class="ais-InfiniteHits-loadPrevious ais-InfiniteHits-loadPrevious--disabled"
            disabled=""
          >
            Show previous results
          </button>
          <ol
            class="ais-InfiniteHits-list"
          >
            <li
              class="ais-InfiniteHits-item"
            >
              <div
                style="word-break: break-all;"
              >
                {"objectID":"abc","__position":1}
                …
              </div>
            </li>
            <li
              class="ais-InfiniteHits-item"
            >
              <div
                style="word-break: break-all;"
              >
                {"objectID":"def","__position":2}
                …
              </div>
            </li>
          </ol>
          <button
            class="ais-InfiniteHits-loadMore"
          >
            Show more results
          </button>
        </div>
      </div>
    `);
  });

  test('forwards a custom class name to the root element', () => {
    const props = createProps({});

    const { container } = render(
      <InfiniteHits {...props} className="MyInfiniteHits" />
    );

    expect(container.querySelector('.ais-InfiniteHits')!.className).toBe(
      'ais-InfiniteHits MyInfiniteHits'
    );
  });

  test('accepts custom class names', () => {
    const props = createProps({});

    const { container } = render(
      <InfiniteHits
        {...props}
        classNames={{
          root: 'ROOT',
          loadPrevious: 'LOADPREVIOUS',
          loadPreviousDisabled: 'LOADPREVIOUSDISABLED',
          loadMore: 'LOADMORE',
          loadMoreDisabled: 'LOADMOREDISABLED',
          list: 'LIST',
          item: 'ITEM',
        }}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-InfiniteHits ROOT"
        >
          <button
            class="ais-InfiniteHits-loadPrevious LOADPREVIOUS LOADPREVIOUSDISABLED ais-InfiniteHits-loadPrevious--disabled"
            disabled=""
          >
            Show previous results
          </button>
          <ol
            class="ais-InfiniteHits-list LIST"
          >
            <li
              class="ais-InfiniteHits-item ITEM"
            >
              <div
                style="word-break: break-all;"
              >
                {"objectID":"abc","__position":1}
                …
              </div>
            </li>
            <li
              class="ais-InfiniteHits-item ITEM"
            >
              <div
                style="word-break: break-all;"
              >
                {"objectID":"def","__position":2}
                …
              </div>
            </li>
          </ol>
          <button
            class="ais-InfiniteHits-loadMore LOADMORE"
          >
            Show more results
          </button>
        </div>
      </div>
    `);
  });

  test('forwards `div` props to the root element', () => {
    const props = createProps({});

    const { container } = render(
      <InfiniteHits {...props} title="hello world" />
    );

    expect(
      container.querySelector<HTMLDivElement>('.ais-InfiniteHits')!.title
    ).toBe('hello world');
  });

  test('renders with custom hitComponent', () => {
    const props = createProps({});

    const { container } = render(
      <InfiniteHits
        {...props}
        hitComponent={({ hit }) => <strong>{hit.objectID}</strong>}
      />
    );

    expect(container.querySelectorAll('strong')).toHaveLength(2);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-InfiniteHits"
        >
          <button
            class="ais-InfiniteHits-loadPrevious ais-InfiniteHits-loadPrevious--disabled"
            disabled=""
          >
            Show previous results
          </button>
          <ol
            class="ais-InfiniteHits-list"
          >
            <li
              class="ais-InfiniteHits-item"
            >
              <strong>
                abc
              </strong>
            </li>
            <li
              class="ais-InfiniteHits-item"
            >
              <strong>
                def
              </strong>
            </li>
          </ol>
          <button
            class="ais-InfiniteHits-loadMore"
          >
            Show more results
          </button>
        </div>
      </div>
    `);
  });

  test('renders without showPrevious if disabled', () => {
    const props = createProps({});

    const { container } = render(
      <InfiniteHits {...props} onShowPrevious={undefined} />
    );

    expect(
      container.querySelector('.ais-InfiniteHits-loadPrevious')
    ).toBeNull();
  });

  test('passes an `onShowPrevious` callback to the "Show Previous" button', () => {
    const props = createProps({});
    const onShowPrevious = jest.fn();

    const { container } = render(
      <InfiniteHits
        {...props}
        isFirstPage={false}
        onShowPrevious={onShowPrevious}
      />
    );

    act(() => {
      userEvent.click(
        container.querySelector('.ais-InfiniteHits-loadPrevious')!
      );
    });

    expect(onShowPrevious).toHaveBeenCalledTimes(1);
  });

  test('passes an `onShowMore` callback to the "Show More" button', () => {
    const props = createProps({});
    const onShowMore = jest.fn();

    const { container } = render(
      <InfiniteHits {...props} isFirstPage={false} onShowMore={onShowMore} />
    );

    act(() => {
      userEvent.click(container.querySelector('.ais-InfiniteHits-loadMore')!);
    });

    expect(onShowMore).toHaveBeenCalledTimes(1);
  });

  test('disables the "Show Previous" button', () => {
    const props = createProps({});

    const { container } = render(
      <InfiniteHits {...props} isFirstPage onShowPrevious={() => {}} />
    );

    expect(
      container.querySelector('.ais-InfiniteHits-loadPrevious')!.className
    ).toEqual(
      'ais-InfiniteHits-loadPrevious ais-InfiniteHits-loadPrevious--disabled'
    );
  });

  test('disables the "Show More" button', () => {
    const props = createProps({});

    const { container } = render(
      <InfiniteHits {...props} isLastPage onShowMore={() => {}} />
    );

    expect(
      container.querySelector('.ais-InfiniteHits-loadMore')!.className
    ).toEqual('ais-InfiniteHits-loadMore ais-InfiniteHits-loadMore--disabled');
  });
});
