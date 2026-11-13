/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { fireEvent, render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { Fragment, createElement } from 'preact';

import { createInfiniteHitsComponent } from '../InfiniteHits';

import type { InfiniteHitsProps } from '../InfiniteHits';
import type { Hit } from 'instantsearch.js';

describe('InfiniteHits', () => {
  const InfiniteHits = createInfiniteHitsComponent({ createElement, Fragment });
  function createProps<THit extends Hit = Hit>(
    props: Omit<Partial<InfiniteHitsProps<THit>>, 'sendEvent'>
  ): Omit<InfiniteHitsProps<THit>, 'sendEvent'> & {
    sendEvent: jest.Mock;
  } {
    return {
      hits: [
        { objectID: 'abc', __position: 1 },
        { objectID: 'def', __position: 2 },
      ] as THit[],
      sendEvent: jest.fn(),
      itemComponent: ({ hit, index: _index, ...itemProps }) => (
        <li key={hit.objectID} {...itemProps}>
          {hit.objectID}
        </li>
      ),
      isFirstPage: true,
      isLastPage: false,
      onShowPrevious: jest.fn(),
      onShowMore: jest.fn(),
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
              abc
            </li>
            <li
              class="ais-InfiniteHits-item"
            >
              def
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

  test('renders hits as JSON without itemComponent', () => {
    const props = createProps({ itemComponent: undefined });
    const { container } = render(<InfiniteHits {...props} />);
    expect(container.querySelector('.ais-InfiniteHits-list'))
      .toMatchInlineSnapshot(`
      <ol
        class="ais-InfiniteHits-list"
      >
        <li
          class="ais-InfiniteHits-item"
        >
          {
        "objectID": "abc",
        "__position": 1
      }
        </li>
        <li
          class="ais-InfiniteHits-item"
        >
          {
        "objectID": "def",
        "__position": 2
      }
        </li>
      </ol>
    `);

    fireEvent.click(container.querySelector('.ais-InfiniteHits-item')!);
    expect(props.sendEvent).toHaveBeenCalledTimes(1);
    expect(props.sendEvent).toHaveBeenLastCalledWith(
      'click:internal',
      props.hits[0],
      'Hit Clicked'
    );
  });

  test('renders with a banner (navigable)', () => {
    const props = createProps({
      banner: {
        image: {
          urls: [{ url: 'https://example.com/image.jpg' }],
        },
        link: {
          url: 'https://example.com',
        },
      },
    });
    const { container } = render(<InfiniteHits {...props} />);
    expect(container.querySelector('.ais-InfiniteHits-banner'))
      .toMatchInlineSnapshot(`
      <aside
        class="ais-InfiniteHits-banner"
      >
        <a
          class="ais-InfiniteHits-banner-link"
          href="https://example.com"
        >
          <img
            class="ais-InfiniteHits-banner-image"
            src="https://example.com/image.jpg"
          />
        </a>
      </aside>
    `);
    // The banner sits between the "Show previous" button and the list
    expect(
      container.querySelector('.ais-InfiniteHits-banner')!.previousSibling
    ).toHaveClass('ais-InfiniteHits-loadPrevious');
    expect(
      container.querySelector('.ais-InfiniteHits-banner')!.nextSibling
    ).toHaveClass('ais-InfiniteHits-list');
  });

  test('renders with a banner (non-navigable)', () => {
    const props = createProps({
      banner: {
        image: {
          urls: [{ url: 'https://example.com/image.jpg' }],
        },
      },
    });
    const { container } = render(<InfiniteHits {...props} />);
    expect(container.querySelector('.ais-InfiniteHits-banner'))
      .toMatchInlineSnapshot(`
      <aside
        class="ais-InfiniteHits-banner"
      >
        <img
          class="ais-InfiniteHits-banner-image"
          src="https://example.com/image.jpg"
        />
      </aside>
    `);
  });

  test('does not render the default banner without an image', () => {
    const props = createProps({
      banner: {
        image: {
          urls: [{ url: '' }],
        },
      },
    });
    const { container } = render(<InfiniteHits {...props} />);
    expect(container.querySelector('.ais-InfiniteHits-banner')).toBeNull();
  });

  test('renders with translations', () => {
    const props = createProps({
      translations: {
        showPreviousButtonText: 'Load previous page',
        showMoreButtonText: 'Load next page',
      },
    });
    const { container } = render(<InfiniteHits {...props} />);
    expect(
      container.querySelector('.ais-InfiniteHits-loadPrevious')
    ).toHaveTextContent('Load previous page');
    expect(
      container.querySelector('.ais-InfiniteHits-loadMore')
    ).toHaveTextContent('Load next page');
  });

  test('accepts custom class names', () => {
    const props = createProps({
      className: 'MyCustomInfiniteHits',
      banner: {
        image: {
          urls: [{ url: 'https://example.com/image.jpg' }],
        },
        link: {
          url: 'https://example.com',
        },
      },
      classNames: {
        root: ['ROOT-A', 'ROOT-B'],
        loadPrevious: 'LOADPREVIOUS',
        disabledLoadPrevious: 'LOADPREVIOUSDISABLED',
        loadMore: 'LOADMORE',
        disabledLoadMore: 'LOADMOREDISABLED',
        list: 'LIST',
        item: 'ITEM',
        bannerRoot: 'BANNERROOT',
        bannerImage: 'BANNERIMAGE',
        bannerLink: 'BANNERLINK',
      },
    });
    const { container } = render(<InfiniteHits {...props} />);
    expect(container.querySelector('.ais-InfiniteHits')!.className).toBe(
      'ais-InfiniteHits ROOT-A ROOT-B MyCustomInfiniteHits'
    );
    expect(
      container.querySelector('.ais-InfiniteHits-loadPrevious')!.className
    ).toBe(
      'ais-InfiniteHits-loadPrevious LOADPREVIOUS ais-InfiniteHits-loadPrevious--disabled LOADPREVIOUSDISABLED'
    );
    expect(container.querySelector('.ais-InfiniteHits-list')!.className).toBe(
      'ais-InfiniteHits-list LIST'
    );
    expect(container.querySelector('.ais-InfiniteHits-item')!.className).toBe(
      'ais-InfiniteHits-item ITEM'
    );
    expect(
      container.querySelector('.ais-InfiniteHits-loadMore')!.className
    ).toBe('ais-InfiniteHits-loadMore LOADMORE');
    expect(container.querySelector('.ais-InfiniteHits-banner')!.className).toBe(
      'ais-InfiniteHits-banner BANNERROOT'
    );
    expect(
      container.querySelector('.ais-InfiniteHits-banner-link')!.className
    ).toBe('ais-InfiniteHits-banner-link BANNERLINK');
    expect(
      container.querySelector('.ais-InfiniteHits-banner-image')!.className
    ).toBe('ais-InfiniteHits-banner-image BANNERIMAGE');
  });

  test('accepts custom class names (empty)', () => {
    const props = createProps({
      hits: [],
      isLastPage: true,
      className: 'MyCustomInfiniteHits',
      classNames: {
        root: 'ROOT',
        emptyRoot: 'EMPTYROOT',
        loadMore: 'LOADMORE',
        disabledLoadMore: 'LOADMOREDISABLED',
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
            class="ais-InfiniteHits-loadMore LOADMORE ais-InfiniteHits-loadMore--disabled LOADMOREDISABLED"
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

    userEvent.click(container.querySelectorAll('.ais-InfiniteHits-item')[0]);
    expect(props.sendEvent).toHaveBeenCalledTimes(1);
    expect(props.sendEvent).toHaveBeenLastCalledWith(
      'click:internal',
      props.hits[0],
      'Hit Clicked'
    );

    // AuxClick event is sent when clicking on a hit with the middle mouse
    // button
    props.sendEvent.mockClear();
    fireEvent(
      container.querySelectorAll('.ais-InfiniteHits-item')[1],
      new MouseEvent('auxclick', { button: 1 })
    );
    expect(props.sendEvent).toHaveBeenCalledTimes(1);
    expect(props.sendEvent).toHaveBeenLastCalledWith(
      'click:internal',
      props.hits[1],
      'Hit Clicked'
    );
  });

  describe('itemComponent', () => {
    test('renders with props', () => {
      const props = createProps({
        hits: [{ objectID: 'abc', __position: 1, custom: 'value' }],
        itemComponent: jest.fn(({ hit, index, ...itemProps }) => (
          <li {...itemProps}>
            {hit.objectID}:{hit.custom}:{index}
          </li>
        )),
      });
      const { container } = render(<InfiniteHits {...props} />);

      expect(props.itemComponent).toHaveBeenCalledWith(
        expect.objectContaining({
          hit: props.hits[0],
          index: 0,
          className: 'ais-InfiniteHits-item',
        }),
        {}
      );
      expect(container.querySelector('.ais-InfiniteHits-item'))
        .toMatchInlineSnapshot(`
        <li
          class="ais-InfiniteHits-item"
        >
          abc
          :
          value
          :
          0
        </li>
      `);
    });
  });

  describe('emptyComponent', () => {
    test('renders in place of the list and buttons when there are no hits', () => {
      const props = createProps({
        hits: [],
        banner: {
          image: {
            urls: [{ url: 'https://example.com/image.jpg' }],
          },
        },
        emptyComponent: () => <span>No results</span>,
      });
      const { container } = render(<InfiniteHits {...props} />);
      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-InfiniteHits ais-InfiniteHits--empty"
          >
            <aside
              class="ais-InfiniteHits-banner"
            >
              <img
                class="ais-InfiniteHits-banner-image"
                src="https://example.com/image.jpg"
              />
            </aside>
            <span>
              No results
            </span>
          </div>
        </div>
      `);
    });

    test('does not render when there are hits', () => {
      const props = createProps({
        emptyComponent: () => <span>No results</span>,
      });
      const { container } = render(<InfiniteHits {...props} />);
      expect(container).not.toHaveTextContent('No results');
      expect(container.querySelectorAll('.ais-InfiniteHits-item')).toHaveLength(
        2
      );
    });
  });

  describe('bannerComponent', () => {
    test('renders when defined', () => {
      const props = createProps({
        banner: {
          image: {
            urls: [{ url: 'https://example.com/image.jpg' }],
          },
          link: {
            url: 'https://example.com',
          },
        },
        bannerComponent: ({ banner, className }) => (
          <a className={className} href={banner.link?.url}>
            <img src={banner.image.urls[0].url} />
          </a>
        ),
      });
      const { container } = render(<InfiniteHits {...props} />);
      expect(container.querySelector('aside')).toBeNull();
      expect(container.querySelector('.ais-InfiniteHits-banner'))
        .toMatchInlineSnapshot(`
        <a
          class="ais-InfiniteHits-banner"
          href="https://example.com"
        >
          <img
            src="https://example.com/image.jpg"
          />
        </a>
      `);
    });

    test('does not render when no banner data', () => {
      const props = createProps({
        bannerComponent: () => <a className="custom-banner" />,
      });
      const { container } = render(<InfiniteHits {...props} />);
      expect(container.querySelector('.custom-banner')).toBeNull();
    });
  });

  describe('showPrevious', () => {
    test('does not render the "Show previous" button without `onShowPrevious`', () => {
      const props = createProps({ onShowPrevious: undefined });
      const { container } = render(<InfiniteHits {...props} />);
      expect(
        container.querySelector('.ais-InfiniteHits-loadPrevious')
      ).toBeNull();
    });

    test('calls `onShowPrevious` when clicking the "Show previous" button', () => {
      const props = createProps({ isFirstPage: false });
      const { container } = render(<InfiniteHits {...props} />);

      expect(
        container.querySelector('.ais-InfiniteHits-loadPrevious')
      ).not.toBeDisabled();

      userEvent.click(
        container.querySelector('.ais-InfiniteHits-loadPrevious')!
      );
      expect(props.onShowPrevious).toHaveBeenCalledTimes(1);
    });

    test('disables the "Show previous" button on the first page', () => {
      const props = createProps({ isFirstPage: true });
      const { container } = render(<InfiniteHits {...props} />);
      expect(
        container.querySelector('.ais-InfiniteHits-loadPrevious')
      ).toBeDisabled();
    });

    test('renders `loadPreviousComponent` in place of the button', () => {
      const props = createProps({
        isFirstPage: true,
        loadPreviousComponent: jest.fn((buttonProps) => (
          <button {...buttonProps}>Custom previous</button>
        )),
      });
      const { container } = render(<InfiniteHits {...props} />);

      expect(props.loadPreviousComponent).toHaveBeenCalledWith(
        {
          className:
            'ais-InfiniteHits-loadPrevious ais-InfiniteHits-loadPrevious--disabled',
          disabled: true,
          onClick: props.onShowPrevious,
        },
        {}
      );
      expect(
        container.querySelector('.ais-InfiniteHits-loadPrevious')
      ).toHaveTextContent('Custom previous');
    });
  });

  describe('showMore', () => {
    test('calls `onShowMore` when clicking the "Show more" button', () => {
      const props = createProps({});
      const { container } = render(<InfiniteHits {...props} />);

      expect(
        container.querySelector('.ais-InfiniteHits-loadMore')
      ).not.toBeDisabled();

      userEvent.click(container.querySelector('.ais-InfiniteHits-loadMore')!);
      expect(props.onShowMore).toHaveBeenCalledTimes(1);
    });

    test('disables the "Show more" button on the last page', () => {
      const props = createProps({ isLastPage: true });
      const { container } = render(<InfiniteHits {...props} />);
      expect(
        container.querySelector('.ais-InfiniteHits-loadMore')
      ).toBeDisabled();
    });

    test('renders `loadMoreComponent` in place of the button', () => {
      const props = createProps({
        isLastPage: true,
        loadMoreComponent: jest.fn((buttonProps) => (
          <button {...buttonProps}>Custom more</button>
        )),
      });
      const { container } = render(<InfiniteHits {...props} />);

      expect(props.loadMoreComponent).toHaveBeenCalledWith(
        {
          className:
            'ais-InfiniteHits-loadMore ais-InfiniteHits-loadMore--disabled',
          disabled: true,
          onClick: props.onShowMore,
        },
        {}
      );
      expect(
        container.querySelector('.ais-InfiniteHits-loadMore')
      ).toHaveTextContent('Custom more');
    });
  });
});
