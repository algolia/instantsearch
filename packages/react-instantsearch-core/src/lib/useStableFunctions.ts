import { forwardRef, useRef } from 'react';

import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

type Path = Array<string | number>;
type Wrapper = (...args: unknown[]) => unknown;

const MEMO = Symbol.for('react.memo');
const FORWARD_REF = Symbol.for('react.forward_ref');

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  // React elements and `lazy` must keep their identity.
  if ('$$typeof' in value) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}

function getAtPath(root: unknown, path: Path): unknown {
  return path.reduce<any>((node, key) => node?.[key], root);
}

/**
 * Replaces every function inside plain objects and arrays with a wrapper that
 * has the same identity on every render and calls the latest function at that
 * position. Props compared with `dequal` then only change when their data
 * changes, so inline callbacks neither loop nor go stale.
 */
export function useStableFunctions<TValue>(value: TValue): TValue {
  const committedRef = useRef(value);
  const renderRef = useRef(value);
  const wrappersRef = useRef(new Map<string, any>());

  // Components and `shouldRender` run during render and read the props being
  // rendered. Other callbacks read committed props because a
  // suspended transition must not change what the visible tree calls.
  renderRef.current = value;
  useIsomorphicLayoutEffect(() => {
    committedRef.current = value;
  });

  const wrappers = new Map<string, any>();

  function stabilize(node: any, path: Path, inComponent = false): unknown {
    if (typeof node === 'function') {
      // Classes cannot be called through `apply`.
      if (node.prototype?.isReactComponent) {
        return node;
      }

      const lastKey = path[path.length - 1];
      const isComponent =
        inComponent ||
        (typeof lastKey === 'string' && /component$/i.test(lastKey));
      const runsWhileRendering = isComponent || lastKey === 'shouldRender';
      const source = isComponent ? node.toString() : '';
      const key = JSON.stringify(path) + source;
      const wrapper: Wrapper =
        wrappersRef.current.get(key) ||
        function (this: unknown, ...args) {
          const latest = getAtPath(
            (runsWhileRendering ? renderRef : committedRef).current,
            path
          );
          // The UI keeps the first wrapper it received, so a swapped component
          // must not run inside the old component's hook state. Inline copies
          // of the same component share their source and stay current.
          const current =
            isComponent && String(latest) !== source ? node : latest;

          // Keep the caller's `this`: native `fetch` throws when it is bound to
          // another object.
          return typeof current === 'function'
            ? current.apply(this, args)
            : undefined;
        };
      if (isComponent) {
        // React reads `defaultProps` (before 19) and DevTools reads `displayName`
        // from the component type.
        Object.assign(wrapper, {
          defaultProps: node.defaultProps,
          displayName: node.displayName || node.name,
        });
      }
      wrappers.set(key, wrapper);

      return wrapper;
    }

    // The chat passes a new `context` on every render, so `memo` never skips
    // a render there and only the inner component needs a stable identity.
    if (node?.$$typeof === MEMO) {
      const inner = stabilize(node.type, [...path, 'type'], true) as any;
      // A class comes back as is, so keep the memo with its own defaults.
      if (inner === node.type) {
        return node;
      }
      if (node.displayName && typeof inner === 'function') {
        inner.displayName = node.displayName;
      }
      // React fills the memo's own `defaultProps` first, then the inner ones.
      if (node.defaultProps) {
        Object.assign(inner, {
          defaultProps: { ...inner.defaultProps, ...node.defaultProps },
        });
      }

      return inner;
    }

    if (node?.$$typeof === FORWARD_REF) {
      const render = stabilize(node.render, [...path, 'render'], true);
      const key = JSON.stringify(path) + 'forwardRef';
      const cached = wrappersRef.current.get(key);
      const stable =
        cached?.render === render ? cached : forwardRef(render as any);
      Object.assign(stable, {
        displayName: node.displayName,
        defaultProps: node.defaultProps,
        propTypes: node.propTypes,
      });
      wrappers.set(key, stable);

      return stable;
    }

    if (Array.isArray(node)) {
      return node.map((item, index) => stabilize(item, [...path, index]));
    }

    if (isPlainObject(node)) {
      return Object.keys(node).reduce<Record<string, unknown>>(
        (result, key) => {
          result[key] = stabilize(node[key], [...path, key]);
          return result;
        },
        {}
      );
    }

    return node;
  }

  const stableValue = stabilize(value, []) as TValue;
  // Add in render so retries before a commit reuse the same wrappers. Prune in
  // the commit so a render React throws away cannot drop committed wrappers.
  wrappers.forEach((wrapper, key) => wrappersRef.current.set(key, wrapper));
  useIsomorphicLayoutEffect(() => {
    wrappersRef.current.forEach((_, key) => {
      if (!wrappers.has(key)) {
        wrappersRef.current.delete(key);
      }
    });
  });

  return stableValue;
}
