/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createAlgoliaSearchClient } from '@instantsearch/mocks';
import { renderHook, act } from '@testing-library/react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

import { useInstantSearchApi } from '../useInstantSearchApi';

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

  test('creates a new instance when subscribe is called after a timeout (Activity hide/reveal)', () => {
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
});
