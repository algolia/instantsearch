/**
 * @jest-environment jsdom
 */

import { createAutocompletePropGetters } from '../createAutocompletePropGetters';

describe('createAutocompletePropGetters', () => {
  // Mock React hooks
  const mockUseEffect = jest.fn((effect) => {
    // Execute the effect immediately for testing
    const cleanup = effect();
    return cleanup;
  });

  const mockUseId = jest.fn(() => 'test-id');

  const mockUseMemo = jest.fn(<T>(factory: () => T) => factory());

  const mockUseRef = jest.fn(<T>(initialValue: T) => ({
    current: initialValue,
  }));

  let mockStateValue = false;
  const mockUseState = jest.fn(<T>(initialState: T | (() => T)) => {
    const value =
      typeof initialState === 'function'
        ? (initialState as () => T)()
        : initialState;
    return [
      value,
      jest.fn((newValue) => {
        mockStateValue = newValue as boolean;
      }),
    ];
  }) as typeof import('react').useState;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStateValue = false;
    // Reset body click listeners
    document.body.innerHTML = '';
  });

  const usePropGetters = createAutocompletePropGetters({
    useEffect: mockUseEffect as unknown as typeof import('react').useEffect,
    useId: mockUseId,
    useMemo: mockUseMemo as unknown as typeof import('react').useMemo,
    useRef: mockUseRef as unknown as typeof import('react').useRef,
    useState: mockUseState,
  });

  const defaultParams = {
    indices: [],
    indicesConfig: [],
    onRefine: jest.fn(),
    onSelect: jest.fn(),
    onApply: jest.fn(),
    placeholder: 'Search',
  };

  describe('isDetached parameter', () => {
    test('should return isOpen, setIsOpen, and focusInput in the result', () => {
      const result = usePropGetters(defaultParams);

      expect(result).toHaveProperty('isOpen');
      expect(result).toHaveProperty('setIsOpen');
      expect(result).toHaveProperty('focusInput');
      expect(typeof result.setIsOpen).toBe('function');
      expect(typeof result.focusInput).toBe('function');
    });

    test('should not add body click listener when isDetached is true', () => {
      const addEventListenerSpy = jest.spyOn(document.body, 'addEventListener');

      usePropGetters({
        ...defaultParams,
        isDetached: true,
      });

      // The effect should return early without adding event listener
      expect(addEventListenerSpy).not.toHaveBeenCalledWith(
        'click',
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
    });

    test('should add body click listener when isDetached is false', () => {
      const addEventListenerSpy = jest.spyOn(document.body, 'addEventListener');

      usePropGetters({
        ...defaultParams,
        isDetached: false,
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'click',
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
    });

    test('getInputProps should not close panel on Tab when isDetached is true', () => {
      const setIsOpenMock = jest.fn();

      // Override useState to capture setIsOpen
      const customUseState = jest.fn((initialState) => {
        const value =
          typeof initialState === 'function' ? initialState() : initialState;
        return [value, setIsOpenMock];
      });

      const customUsePropGetters = createAutocompletePropGetters({
        useEffect: mockUseEffect as unknown as typeof import('react').useEffect,
        useId: mockUseId,
        useMemo: mockUseMemo as unknown as typeof import('react').useMemo,
        useRef: mockUseRef as unknown as typeof import('react').useRef,
        useState: customUseState as unknown as typeof import('react').useState,
      });

      const result = customUsePropGetters({
        ...defaultParams,
        isDetached: true,
      });

      const inputProps = result.getInputProps();

      // Simulate Tab key press
      const mockEvent = {
        key: 'Tab',
        preventDefault: jest.fn(),
      } as unknown as KeyboardEvent;

      inputProps.onKeyDown?.(
        mockEvent as unknown as React.KeyboardEvent<HTMLInputElement>
      );

      // In detached mode, Tab should NOT call setIsOpen(false)
      expect(setIsOpenMock).not.toHaveBeenCalledWith(false);
    });

    test('getInputProps should close panel on Tab when isDetached is false', () => {
      const setIsOpenMock = jest.fn();

      // Override useState to capture setIsOpen
      const customUseState = jest.fn((initialState) => {
        const value =
          typeof initialState === 'function' ? initialState() : initialState;
        return [value, setIsOpenMock];
      });

      const customUsePropGetters = createAutocompletePropGetters({
        useEffect: mockUseEffect as unknown as typeof import('react').useEffect,
        useId: mockUseId,
        useMemo: mockUseMemo as unknown as typeof import('react').useMemo,
        useRef: mockUseRef as unknown as typeof import('react').useRef,
        useState: customUseState as unknown as typeof import('react').useState,
      });

      const result = customUsePropGetters({
        ...defaultParams,
        isDetached: false,
      });

      const inputProps = result.getInputProps();

      // Simulate Tab key press
      const mockEvent = {
        key: 'Tab',
        preventDefault: jest.fn(),
      } as unknown as KeyboardEvent;

      inputProps.onKeyDown?.(
        mockEvent as unknown as React.KeyboardEvent<HTMLInputElement>
      );

      // In non-detached mode, Tab SHOULD call setIsOpen(false)
      expect(setIsOpenMock).toHaveBeenCalledWith(false);
    });
  });
});
