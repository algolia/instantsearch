/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { act, render, screen, waitFor } from '@testing-library/react';
import { createFeedContainer } from 'instantsearch.js/es/connectors/feeds/FeedContainer';
import React from 'react';

import { IndexContext } from '../../lib/IndexContext';
import { InstantSearchContext } from '../../lib/InstantSearchContext';
import { useIndexContext } from '../../lib/useIndexContext';
import { Feeds } from '../Feeds';

import type { IndexWidget } from 'instantsearch.js/es/widgets/index/index';

let mockFeedIDs: string[] = [];

jest.mock('../../connectors/useFeeds', () => ({
  useFeeds: jest.fn(() => ({ feedIDs: mockFeedIDs })),
}));

jest.mock('instantsearch.js/es/connectors/feeds/FeedContainer', () => ({
  createFeedContainer: jest.fn(),
}));

type ParentIndexStub = {
  widgets: IndexWidget[];
  getWidgets: jest.Mock<IndexWidget[], []>;
  addWidgets: jest.Mock<void, [IndexWidget[]]>;
  removeWidgets: jest.Mock<void, [IndexWidget[]]>;
};

function createParentIndexStub(
  orderLog?: string[],
  containerByFeed?: Map<string, IndexWidget>
): ParentIndexStub {
  const widgets: IndexWidget[] = [];
  const parentIndex: ParentIndexStub = {
    widgets,
    getWidgets: jest.fn(() => widgets),
    addWidgets: jest.fn((toAdd) => {
      toAdd.forEach((widget) => {
        widgets.push(widget);
        if (orderLog && (widget as any).__feedID) {
          orderLog.push(`add:${(widget as any).__feedID}`);
        }
      });
    }),
    removeWidgets: jest.fn((toRemove) => {
      toRemove.forEach((widget) => {
        const index = widgets.indexOf(widget);
        if (index > -1) {
          widgets.splice(index, 1);
        }
      });
    }),
  };

  (createFeedContainer as jest.Mock).mockImplementation((feedID: string) => {
    const container = { __feedID: feedID } as unknown as IndexWidget;
    if (containerByFeed) {
      containerByFeed.set(feedID, container);
    }
    return container;
  });

  return parentIndex;
}

function FeedScopedChild({ feedID }: { feedID: string }) {
  const index = useIndexContext() as any;
  return (
    <div data-testid={`feed-${feedID}`}>{`${feedID}:${index.__feedID}`}</div>
  );
}

describe('Feeds', () => {
  beforeEach(() => {
    mockFeedIDs = [];
    (createFeedContainer as jest.Mock).mockReset();
  });

  it('renders feeds in order and scopes children per feed container', async () => {
    mockFeedIDs = ['products', 'articles'];
    const parentIndex = createParentIndexStub();
    const instantSearch = {} as any;

    const { rerender } = render(
      <InstantSearchContext.Provider value={instantSearch}>
        <IndexContext.Provider value={parentIndex as any}>
          <Feeds
            searchScope="global"
            renderFeed={({ feedID }) => <FeedScopedChild feedID={feedID} />}
          />
        </IndexContext.Provider>
      </InstantSearchContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('feed-products')).toHaveTextContent(
        'products:products'
      );
      expect(screen.getByTestId('feed-articles')).toHaveTextContent(
        'articles:articles'
      );
    });

    expect(
      screen.getAllByTestId(/feed-/).map((element) => element.textContent)
    ).toEqual(['products:products', 'articles:articles']);

    mockFeedIDs = ['articles', 'products'];
    rerender(
      <InstantSearchContext.Provider value={instantSearch}>
        <IndexContext.Provider value={parentIndex as any}>
          <Feeds
            searchScope="global"
            renderFeed={({ feedID }) => <FeedScopedChild feedID={feedID} />}
          />
        </IndexContext.Provider>
      </InstantSearchContext.Provider>
    );

    await waitFor(() => {
      expect(
        screen.getAllByTestId(/feed-/).map((element) => element.textContent)
      ).toEqual(['articles:articles', 'products:products']);
    });
  });

  it('removes disappeared feeds after deferred parent cleanup', async () => {
    jest.useFakeTimers();
    mockFeedIDs = ['products', 'articles'];
    const containerByFeed = new Map<string, IndexWidget>();
    const parentIndex = createParentIndexStub(undefined, containerByFeed);
    const instantSearch = {} as any;

    const { rerender } = render(
      <InstantSearchContext.Provider value={instantSearch}>
        <IndexContext.Provider value={parentIndex as any}>
          <Feeds
            searchScope="global"
            renderFeed={({ feedID }) => (
              <div data-testid={`feed-${feedID}`}>{feedID}</div>
            )}
          />
        </IndexContext.Provider>
      </InstantSearchContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('feed-products')).toBeTruthy();
      expect(screen.getByTestId('feed-articles')).toBeTruthy();
    });

    mockFeedIDs = ['products'];
    rerender(
      <InstantSearchContext.Provider value={instantSearch}>
        <IndexContext.Provider value={parentIndex as any}>
          <Feeds
            searchScope="global"
            renderFeed={({ feedID }) => (
              <div data-testid={`feed-${feedID}`}>{feedID}</div>
            )}
          />
        </IndexContext.Provider>
      </InstantSearchContext.Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('feed-articles')).toBeNull();
    });

    act(() => {
      jest.runAllTimers();
    });

    expect(parentIndex.removeWidgets).toHaveBeenCalledWith([
      containerByFeed.get('articles'),
    ]);
    jest.useRealTimers();
  });

  it('reuses a pending feed container when the feed reappears before deferred cleanup', async () => {
    jest.useFakeTimers();
    mockFeedIDs = ['products'];
    const containerByFeed = new Map<string, IndexWidget>();
    const parentIndex = createParentIndexStub(undefined, containerByFeed);
    const instantSearch = {} as any;

    const { rerender } = render(
      <InstantSearchContext.Provider value={instantSearch}>
        <IndexContext.Provider value={parentIndex as any}>
          <Feeds
            searchScope="global"
            renderFeed={({ feedID }) => (
              <div data-testid={`feed-${feedID}`}>{feedID}</div>
            )}
          />
        </IndexContext.Provider>
      </InstantSearchContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('feed-products')).toBeTruthy();
    });

    const firstFeedContainer = containerByFeed.get('products');

    mockFeedIDs = [];
    rerender(
      <InstantSearchContext.Provider value={instantSearch}>
        <IndexContext.Provider value={parentIndex as any}>
          <Feeds
            searchScope="global"
            renderFeed={({ feedID }) => (
              <div data-testid={`feed-${feedID}`}>{feedID}</div>
            )}
          />
        </IndexContext.Provider>
      </InstantSearchContext.Provider>
    );

    expect(screen.queryByTestId('feed-products')).toBeNull();
    expect(parentIndex.removeWidgets).not.toHaveBeenCalled();

    mockFeedIDs = ['products'];
    rerender(
      <InstantSearchContext.Provider value={instantSearch}>
        <IndexContext.Provider value={parentIndex as any}>
          <Feeds
            searchScope="global"
            renderFeed={({ feedID }) => (
              <div data-testid={`feed-${feedID}`}>{feedID}</div>
            )}
          />
        </IndexContext.Provider>
      </InstantSearchContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('feed-products')).toBeTruthy();
    });

    expect(parentIndex.addWidgets).toHaveBeenCalledTimes(1);
    expect(parentIndex.widgets).toEqual([firstFeedContainer]);

    act(() => {
      jest.runAllTimers();
    });

    expect(parentIndex.removeWidgets).not.toHaveBeenCalled();
    expect(parentIndex.widgets).toEqual([firstFeedContainer]);
    jest.useRealTimers();
  });

  it('does not duplicate add/remove on stable feedIDs', async () => {
    jest.useFakeTimers();
    mockFeedIDs = ['products'];
    const parentIndex = createParentIndexStub();
    const instantSearch = {} as any;

    const { rerender } = render(
      <InstantSearchContext.Provider value={instantSearch}>
        <IndexContext.Provider value={parentIndex as any}>
          <Feeds
            searchScope="global"
            renderFeed={({ feedID }) => (
              <div data-testid={`feed-${feedID}`}>{feedID}</div>
            )}
          />
        </IndexContext.Provider>
      </InstantSearchContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('feed-products')).toBeTruthy();
    });
    expect(parentIndex.addWidgets).toHaveBeenCalledTimes(1);

    rerender(
      <InstantSearchContext.Provider value={instantSearch}>
        <IndexContext.Provider value={parentIndex as any}>
          <Feeds
            searchScope="global"
            renderFeed={({ feedID }) => (
              <div data-testid={`feed-${feedID}`}>{feedID}</div>
            )}
          />
        </IndexContext.Provider>
      </InstantSearchContext.Provider>
    );

    await act(async () => {
      await Promise.resolve();
    });
    expect(parentIndex.addWidgets).toHaveBeenCalledTimes(1);

    mockFeedIDs = [];
    rerender(
      <InstantSearchContext.Provider value={instantSearch}>
        <IndexContext.Provider value={parentIndex as any}>
          <Feeds
            searchScope="global"
            renderFeed={({ feedID }) => (
              <div data-testid={`feed-${feedID}`}>{feedID}</div>
            )}
          />
        </IndexContext.Provider>
      </InstantSearchContext.Provider>
    );

    act(() => {
      jest.runAllTimers();
    });
    expect(parentIndex.removeWidgets).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('registers containers before rendering feed children', async () => {
    mockFeedIDs = ['products'];
    const orderLog: string[] = [];
    const parentIndex = createParentIndexStub(orderLog);
    const instantSearch = {} as any;

    function MountedFeed({ feedID }: { feedID: string }) {
      React.useEffect(() => {
        orderLog.push(`mount:${feedID}`);
      }, [feedID]);

      return <div data-testid={`feed-${feedID}`}>{feedID}</div>;
    }

    render(
      <InstantSearchContext.Provider value={instantSearch}>
        <IndexContext.Provider value={parentIndex as any}>
          <Feeds
            searchScope="global"
            renderFeed={({ feedID }) => <MountedFeed feedID={feedID} />}
          />
        </IndexContext.Provider>
      </InstantSearchContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('feed-products')).toBeTruthy();
    });

    expect(orderLog).toContain('add:products');
    expect(orderLog).toContain('mount:products');
    expect(orderLog.indexOf('add:products')).toBeLessThan(
      orderLog.indexOf('mount:products')
    );
  });

  it('mounts containers for all feedIDs even with empty children', async () => {
    mockFeedIDs = ['products', 'articles'];
    const containerByFeed = new Map<string, IndexWidget>();
    const parentIndex = createParentIndexStub(undefined, containerByFeed);
    const instantSearch = {} as any;

    render(
      <InstantSearchContext.Provider value={instantSearch}>
        <IndexContext.Provider value={parentIndex as any}>
          <Feeds
            searchScope="global"
            renderFeed={({ feedID }) =>
              feedID === 'products' ? (
                <div data-testid={`feed-${feedID}`}>{feedID}</div>
              ) : null
            }
          />
        </IndexContext.Provider>
      </InstantSearchContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('feed-products')).toBeTruthy();
    });

    expect(screen.queryByTestId('feed-articles')).toBeNull();
    expect(parentIndex.widgets).toEqual([
      containerByFeed.get('products'),
      containerByFeed.get('articles'),
    ]);
  });
});
