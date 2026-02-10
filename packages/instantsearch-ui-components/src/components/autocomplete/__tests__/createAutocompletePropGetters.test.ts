/**
 * @jest-environment jsdom
 */

import { createAutocompletePropGetters } from '../createAutocompletePropGetters';

import type { UsePropGetters } from '../createAutocompletePropGetters';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

describe('createAutocompletePropGetters', () => {
  type CreateAutocompletePropGettersParams = Parameters<
    typeof createAutocompletePropGetters
  >[0];
  type DefaultParams = Parameters<UsePropGetters<Record<string, unknown>>>[0];

  // Mock React hooks
  const mockUseEffect: CreateAutocompletePropGettersParams['useEffect'] = (
    effect
  ) => {
    effect();
  };

  const mockUseId: CreateAutocompletePropGettersParams['useId'] = () =>
    'test-id';

  const mockUseMemo: CreateAutocompletePropGettersParams['useMemo'] = (
    factory
  ) => factory();

  const mockUseRef: CreateAutocompletePropGettersParams['useRef'] = (
    initialValue
  ) => ({
    current: initialValue,
  });

  const mockUseState: CreateAutocompletePropGettersParams['useState'] = (
    initialState
  ) => [initialState, jest.fn()];

  const createUsePropGetters = (
    overrides: Partial<CreateAutocompletePropGettersParams> = {}
  ) =>
    createAutocompletePropGetters({
      useEffect: mockUseEffect,
      useId: mockUseId,
      useMemo: mockUseMemo,
      useRef: mockUseRef,
      useState: mockUseState,
      ...overrides,
    });

  const createKeyDownEvent = (
    key: string,
    value = ''
  ): ReactKeyboardEvent<HTMLInputElement> => {
    const target = document.createElement('input');
    target.value = value;

    const event: Partial<ReactKeyboardEvent<HTMLInputElement>> & {
      target: EventTarget & HTMLInputElement;
    } = {
      key,
      preventDefault: jest.fn(),
      target,
    };

    return event as ReactKeyboardEvent<HTMLInputElement>;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset body click listeners
    document.body.innerHTML = '';
  });

  const defaultParams: DefaultParams = {
    indices: [],
    indicesConfig: [],
    onRefine: jest.fn(),
    onSelect: jest.fn(),
    onApply: jest.fn(),
    placeholder: 'Search',
  };

  describe('isDetached parameter', () => {
    test('should return isOpen, setIsOpen, and focusInput in the result', () => {
      const usePropGetters = createUsePropGetters();
      const result = usePropGetters(defaultParams);

      expect(result.isOpen).toBe(false);
      expect(typeof result.setIsOpen).toBe('function');
      expect(typeof result.focusInput).toBe('function');
    });

    test('should not add body click listener when isDetached is true', () => {
      const addEventListenerSpy = jest.spyOn(document.body, 'addEventListener');
      const usePropGetters = createUsePropGetters();

      usePropGetters({
        ...defaultParams,
        isDetached: true,
      });

      // The effect should return early without adding event listener
      expect(
        addEventListenerSpy.mock.calls.some(
          ([eventName]) => eventName === 'click'
        )
      ).toBe(false);
      expect(addEventListenerSpy).not.toHaveBeenCalled();

      addEventListenerSpy.mockRestore();
    });

    test('should add body click listener when isDetached is false', () => {
      const addEventListenerSpy = jest.spyOn(document.body, 'addEventListener');
      const usePropGetters = createUsePropGetters();

      usePropGetters({
        ...defaultParams,
        isDetached: false,
      });

      expect(
        addEventListenerSpy.mock.calls.some(
          ([eventName, listener]) =>
            eventName === 'click' && typeof listener === 'function'
        )
      ).toBe(true);
      expect(addEventListenerSpy).toHaveBeenCalled();

      addEventListenerSpy.mockRestore();
    });

    test('getInputProps should not close panel on Tab when isDetached is true', () => {
      const setIsOpenMock = jest.fn();

      // Override useState to capture setIsOpen
      const customUseState: CreateAutocompletePropGettersParams['useState'] = (
        initialState
      ) => [initialState, setIsOpenMock];

      const customUsePropGetters = createUsePropGetters({
        useState: customUseState,
      });

      const result = customUsePropGetters({
        ...defaultParams,
        isDetached: true,
      });

      const inputProps = result.getInputProps();

      // Simulate Tab key press
      inputProps.onKeyDown?.(createKeyDownEvent('Tab'));

      // In detached mode, Tab should NOT call setIsOpen(false)
      expect(setIsOpenMock).not.toHaveBeenCalledWith(false);
    });

    test('getInputProps should close panel on Tab when isDetached is false', () => {
      const setIsOpenMock = jest.fn();

      // Override useState to capture setIsOpen
      const customUseState: CreateAutocompletePropGettersParams['useState'] = (
        initialState
      ) => [initialState, setIsOpenMock];

      const customUsePropGetters = createUsePropGetters({
        useState: customUseState,
      });

      const result = customUsePropGetters({
        ...defaultParams,
        isDetached: false,
      });

      const inputProps = result.getInputProps();

      // Simulate Tab key press
      inputProps.onKeyDown?.(createKeyDownEvent('Tab'));

      // In non-detached mode, Tab SHOULD call setIsOpen(false)
      expect(setIsOpenMock).toHaveBeenCalledWith(false);
    });

    test('getInputProps should call onSubmit on Enter', () => {
      const onSubmit = jest.fn();
      const onRefine = jest.fn();

      const customUsePropGetters = createUsePropGetters({
        useState: mockUseState,
      });

      const result = customUsePropGetters({
        ...defaultParams,
        onRefine,
        onSubmit,
      });

      const inputProps = result.getInputProps();
      inputProps.onKeyDown?.(createKeyDownEvent('Enter', 'hello'));

      expect(onRefine).toHaveBeenCalledWith('hello');
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });
});
