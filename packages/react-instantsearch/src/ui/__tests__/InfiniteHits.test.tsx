/**
 * @jest-environment jsdom
 */

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
      sendEvent: jest.fn(),
      isFirstPage: true,
      isLastPage: false,
      onShowPrevious: jest.fn(),
      onShowMore: jest.fn(),
      translations: {
        showPreviousButtonText: 'Show previous results',
        showMoreButtonText: 'Show more results',
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

  test('renders with translations', () => {
    const props = createProps({
      translations: {
        showPreviousButtonText: 'Load previous page',
        showMoreButtonText: 'Load next page',
      },
    });
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
            Load previous page
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
            Load next page
          </button>
        </div>
      </div>
    `);
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

  test('passes sendEvent to hitComponent', () => {
    const props = createProps({
      hitComponent: ({ hit, sendEvent }) => (
        <button className="hitButton" onClick={() => sendEvent(hit)}>
          {hit.objectID}
        </button>
      ),
    });

    const { container } = render(<InfiniteHits {...props} />);

    userEvent.click(container.querySelector('.hitButton')!);

    expect(props.sendEvent).toHaveBeenCalledTimes(2);
    expect((props.sendEvent as jest.Mock).mock.calls[0][0]).toBe(props.hits[0]);
  });

  describe('showPrevious', () => {
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
  });

  describe('showMore', () => {
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

    test('disables the "Show More" button', () => {
      const props = createProps({});

      const { container } = render(
        <InfiniteHits {...props} isLastPage onShowMore={() => {}} />
      );

      expect(
        container.querySelector('.ais-InfiniteHits-loadMore')!.className
      ).toEqual(
        'ais-InfiniteHits-loadMore ais-InfiniteHits-loadMore--disabled'
      );
    });
  });

  test('accepts custom class names', () => {
    const props = createProps({
      className: 'MyCustomInfiniteHits',
      classNames: {
        root: 'ROOT',
        loadPrevious: 'LOADPREVIOUS',
        disabledLoadPrevious: 'LOADPREVIOUSDISABLED',
        loadMore: 'LOADMORE',
        disabledLoadMore: 'LOADMOREDISABLED',
        list: 'LIST',
        item: 'ITEM',
      },
    });

    const { container } = render(<InfiniteHits {...props} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-InfiniteHits ROOT MyCustomInfiniteHits"
        >
          <button
            class="ais-InfiniteHits-loadPrevious LOADPREVIOUS ais-InfiniteHits-loadPrevious--disabled LOADPREVIOUSDISABLED"
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

  test('accepts custom class names (empty)', () => {
    const props = createProps({
      hits: [] as Hit[],
      isLastPage: true,
      className: 'MyCustomInfiniteHits',
      classNames: {
        root: 'ROOT',
        emptyRoot: 'EMPTYROOT',
        loadMore: 'LOADMORE',
        disabledLoadMore: 'DISABLEDLOADMORE',
      },
    });
    const { container } = render(<InfiniteHits {...props} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-InfiniteHits ROOT ais-InfiniteHits--empty EMPTYROOT MyCustomInfiniteHits"
        >
          <button
            class="ais-InfiniteHits-loadPrevious ais-InfiniteHits-loadPrevious--disabled"
            disabled=""
          >
            Show previous results
          </button>
          <ol
            class="ais-InfiniteHits-list"
          />
          <button
            class="ais-InfiniteHits-loadMore LOADMORE ais-InfiniteHits-loadMore--disabled DISABLEDLOADMORE"
            disabled=""
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

    expect(container.querySelector('.ais-InfiniteHits')).toHaveAttribute(
      'title',
      'hello world'
    );
  });

  test('sends a default `click` event when clicking on a hit', () => {
    const props = createProps({});

    const { container } = render(<InfiniteHits {...props} />);

    userEvent.click(container.querySelectorAll('.ais-InfiniteHits-item')[0]!);

    expect(props.sendEvent).toHaveBeenCalledTimes(1);
    expect(props.sendEvent).toHaveBeenLastCalledWith(
      'click:internal',
      props.hits[0],
      'Hit Clicked'
    );
  });
});
