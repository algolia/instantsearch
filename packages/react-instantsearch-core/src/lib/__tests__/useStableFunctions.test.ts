/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { render, renderHook } from '@testing-library/react';
import React from 'react';

import { useStableFunctions } from '../useStableFunctions';

describe('useStableFunctions', () => {
  test('keeps function identities across renders while data is unchanged', () => {
    const { result, rerender } = renderHook(() =>
      useStableFunctions({ a: 1, tools: { search: { onToolCall: () => {} } } })
    );
    const first = result.current;

    rerender();

    expect(result.current.tools.search.onToolCall).toBe(
      first.tools.search.onToolCall
    );
  });

  test('calls the latest function', () => {
    const first = jest.fn(() => 'first');
    const second = jest.fn(() => 'second');
    const { result, rerender } = renderHook(
      ({ onToolCall }) =>
        useStableFunctions({ tools: { search: { onToolCall } } }),
      { initialProps: { onToolCall: first } }
    );

    rerender({ onToolCall: second });

    expect(result.current.tools.search.onToolCall()).toBe('second');
    expect(first).not.toHaveBeenCalled();
  });

  test('keeps an unbound call unbound', () => {
    let receivedThis: unknown = 'unset';
    const { result } = renderHook(() =>
      useStableFunctions({
        transport: {
          fetch: function (this: unknown) {
            receivedThis = this;
          },
        },
      })
    );

    const { fetch } = result.current.transport;
    fetch();

    expect(receivedThis).toBeUndefined();
  });

  test('calls the current function when invoked during render', () => {
    const { result, rerender } = renderHook(
      ({ visible }) =>
        useStableFunctions({
          tools: { search: { shouldRender: () => visible } },
        }).tools.search.shouldRender(),
      { initialProps: { visible: true } }
    );

    expect(result.current).toBe(true);

    rerender({ visible: false });

    expect(result.current).toBe(false);
  });

  test('leaves React component types untouched', () => {
    const Memoized = React.memo(() => null);
    const Forwarded = React.forwardRef(() => null);
    const { result, rerender } = renderHook(() =>
      useStableFunctions({ tools: { a: { Memoized, Forwarded } } })
    );

    rerender();

    expect(result.current.tools.a.Memoized).toBe(Memoized);
    expect(result.current.tools.a.Forwarded).toBe(Forwarded);
  });

  test('leaves class instances untouched', () => {
    class Instance {
      method() {}
    }
    const instance = new Instance();
    const { result } = renderHook(() => useStableFunctions({ chat: instance }));

    expect(result.current.chat).toBe(instance);
  });

  test('keeps the identity of a recreated inline component', () => {
    const { result, rerender } = renderHook(() =>
      useStableFunctions({ tools: { a: { layoutComponent: () => 'x' } } })
    );
    const first = result.current.tools.a.layoutComponent;

    rerender();
    rerender();

    expect(result.current.tools.a.layoutComponent).toBe(first);
  });

  test('keeps the first wrapper on the original component after a swap', () => {
    const A = () => 'A';
    const B = () => 'B';
    const { result, rerender } = renderHook(
      ({ component }) =>
        useStableFunctions({ tools: { a: { layoutComponent: component } } }),
      { initialProps: { component: A } }
    );
    const first = result.current.tools.a.layoutComponent;

    rerender({ component: B });

    expect(first()).toBe('A');
    expect(result.current.tools.a.layoutComponent).not.toBe(first);
    expect(result.current.tools.a.layoutComponent()).toBe('B');
  });

  test('calls the latest copy of an inline component', () => {
    const { result, rerender } = renderHook(
      ({ label }) =>
        useStableFunctions({
          tools: { a: { layoutComponent: () => 'x' + label.length } },
        }),
      { initialProps: { label: 'one' } }
    );
    const first = result.current.tools.a.layoutComponent;

    rerender({ label: 'three' });

    expect(result.current.tools.a.layoutComponent).toBe(first);
    expect(first()).toBe('x5');
  });

  test('carries defaultProps and displayName onto a wrapped component', () => {
    function Layout() {
      return null;
    }
    // Components written before React 19 still rely on this static.
    // eslint-disable-next-line instantsearch/no-default-props-assignment
    Layout.defaultProps = { word: 'default' };
    Layout.displayName = 'MyLayout';
    const { result } = renderHook(() =>
      useStableFunctions({ tools: { a: { layoutComponent: Layout } } })
    );
    const wrapped: any = result.current.tools.a.layoutComponent;

    expect(wrapped.defaultProps).toEqual({ word: 'default' });
    expect(wrapped.displayName).toBe('MyLayout');
  });

  test('leaves class components untouched', () => {
    class Layout extends React.Component {
      render() {
        return null;
      }
    }
    const { result } = renderHook(() =>
      useStableFunctions({ tools: { a: { layoutComponent: Layout } } })
    );

    expect(result.current.tools.a.layoutComponent).toBe(Layout);
  });

  test('remounts with fresh state when the component is swapped', () => {
    function A() {
      const [state] = React.useState('A-state');
      return React.createElement('i', null, state);
    }
    function B() {
      const [state] = React.useState('B-state');
      return React.createElement('i', null, state);
    }
    const hook = renderHook(
      ({ component }) =>
        useStableFunctions({ tools: { a: { layoutComponent: component } } }),
      { initialProps: { component: A } }
    );
    const view = render(
      React.createElement(hook.result.current.tools.a.layoutComponent)
    );
    expect(view.container.textContent).toBe('A-state');

    hook.rerender({ component: B });
    view.rerender(
      React.createElement(hook.result.current.tools.a.layoutComponent)
    );

    expect(view.container.textContent).toBe('B-state');
  });
});
