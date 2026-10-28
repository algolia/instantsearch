/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createAlgoliaSearchClient } from '@instantsearch/mocks';
import { render, renderHook, act } from '@testing-library/react';
import React from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

import { InstantSearch } from '../../components/InstantSearch';
import { useSearchBox } from '../../connectors/useSearchBox';
import { useInstantSearchApi } from '../useInstantSearchApi';

import type { InternalInstantSearch } from '../useInstantSearchApi';
import type { UiState } from 'instantsearch-core';

jest.mock('use-sync-external-store/shim', () => ({
  useSyncExternalStore: jest.fn(),
}));

describe('useInstantSearchApi', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('restarts the disposed instance when subscribe is called after the cleanup timeout (Activity hide/reveal)', () => {
    let capturedSubscribe: any;

    (useSyncExternalStore as jest.Mock).mockImplementation(
      (subscribe, getSnapshot) => {
        capturedSubscribe = subscribe;
        return getSnapshot();
      }
    );

    const searchClient = createAlgoliaSearchClient({});

    const { result } = renderHook(() =>
      useInstantSearchApi({
        searchClient,
        indexName: 'test',
      })
    );

    const store = result.current;

    // Simulate initial mount (subscribe)
    let cleanup: any;
    act(() => {
      cleanup = capturedSubscribe(() => {});
    });

    // store should be started
    expect(store.started).toBe(true);

    // Simulate hide (cleanup)
    cleanup();

    // Fast-forward timers to let the cleanup timeout run
    act(() => {
      jest.runAllTimers();
    });

    // store should be disposed
    expect(store.started).toBe(false);

    // Simulate reveal (subscribe again)
    act(() => {
      capturedSubscribe(() => {});
    });

    // store should be started again!
    expect(store.started).toBe(true);
  });

  test('removes a widget that unmounts after the instance was restarted (Activity hide/reveal)', () => {
    let capturedSubscribe: any;
    let search: InternalInstantSearch<UiState, UiState>;

    (useSyncExternalStore as jest.Mock).mockImplementation(
      (subscribe, getSnapshot) => {
        capturedSubscribe = subscribe;
        search = getSnapshot();
        return search;
      }
    );

    const searchClient = createAlgoliaSearchClient({});

    function SearchBox() {
      useSearchBox();
      return null;
    }

    function App({ showSearchBox }: { showSearchBox: boolean }) {
      return (
        <InstantSearch searchClient={searchClient} indexName="test">
          {showSearchBox && <SearchBox />}
        </InstantSearch>
      );
    }

    const { rerender } = render(<App showSearchBox={false} />);

    // Simulate initial mount (subscribe)
    let cleanup: any;
    act(() => {
      cleanup = capturedSubscribe(() => {});
    });

    // Simulate hide (cleanup), and let the cleanup timeout run
    act(() => {
      cleanup();
      jest.runAllTimers();
    });

    expect(search!.started).toBe(false);

    // Simulate reveal (subscribe again)
    act(() => {
      capturedSubscribe(() => {});
    });

    expect(search!.started).toBe(true);

    rerender(<App showSearchBox={true} />);

    expect(search!.mainIndex.getWidgets()).toHaveLength(1);

    rerender(<App showSearchBox={false} />);
    act(() => {
      jest.runAllTimers();
    });

    expect(search!.mainIndex.getWidgets()).toHaveLength(0);
  });
});
