/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { renderHook, act } from '@testing-library/react';

import { useIsomorphicLayoutEffect } from '../useIsomorphicLayoutEffect';
import { useWidget } from '../useWidget';

jest.mock('../useIsomorphicLayoutEffect', () => ({
  useIsomorphicLayoutEffect: jest.fn(),
}));

jest.mock('../useInstantSearchContext', () => ({
  useInstantSearchContext: () => ({
    _schedule: (cb: any) => cb(),
  }),
}));

jest.mock('../useRSCContext', () => ({
  useRSCContext: () => ({}),
}));

describe('useWidget', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('adds the widget again when remounted after a timeout (Activity hide/reveal)', () => {
    let capturedEffect: any;

    (useIsomorphicLayoutEffect as jest.Mock).mockImplementation((effect) => {
      capturedEffect = effect;
    });

    const mockWidget = { $$type: 'test.widget' } as any;
    const parentIndex = {
      addWidgets: jest.fn(),
      removeWidgets: jest.fn(),
      getWidgets: jest.fn(() => []),
    } as any;

    renderHook(() =>
      useWidget({
        widget: mockWidget,
        parentIndex,
        props: {},
        shouldSsr: false,
        skipSuspense: false,
      })
    );

    // Simulate initial mount (execute effect)
    let cleanup: any;
    act(() => {
      cleanup = capturedEffect();
    });

    // widget should be added
    expect(parentIndex.addWidgets).toHaveBeenCalledWith([mockWidget]);
    expect(parentIndex.addWidgets).toHaveBeenCalledTimes(1);

    // Simulate hide (execute cleanup)
    act(() => {
      cleanup();
    });

    // Fast-forward timers to let the cleanup timeout run
    act(() => {
      jest.runAllTimers();
    });

    // widget should be removed
    expect(parentIndex.removeWidgets).toHaveBeenCalledWith([mockWidget]);

    // Simulate reveal (execute effect again)
    act(() => {
      capturedEffect(); // This returns a new cleanup function
    });

    // widget should be added AGAIN! (This fails on unpatched code)
    expect(parentIndex.addWidgets).toHaveBeenCalledTimes(2);
  });
});
