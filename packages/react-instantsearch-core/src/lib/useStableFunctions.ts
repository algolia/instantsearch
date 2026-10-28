import { useRef } from 'react';

type Path = Array<string | number>;
type Wrapper = (...args: unknown[]) => unknown;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  // React elements and component types (`memo`, `forwardRef`, `lazy`) must
  // keep their identity.
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
  const latestRef = useRef(value);
  const wrappersRef = useRef(new Map<string, Wrapper>());

  // Updated during render so callbacks invoked while rendering (such as
  // `shouldRender`) see the current props.
  latestRef.current = value;

  const wrappers = new Map<string, Wrapper>();

  function stabilize(node: unknown, path: Path): unknown {
    if (typeof node === 'function') {
      // Classes cannot be called through `apply`.
      if (node.prototype?.isReactComponent) {
        return node;
      }

      const lastKey = path[path.length - 1];
      const isComponent =
        typeof lastKey === 'string' && /component$/i.test(lastKey);
      const source = isComponent ? node.toString() : '';
      const key = JSON.stringify(path) + source;
      const wrapper: Wrapper =
        wrappersRef.current.get(key) ||
        function (this: unknown, ...args) {
          const latest = getAtPath(latestRef.current, path);
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
          defaultProps: (node as any).defaultProps,
          displayName: (node as any).displayName || node.name,
        });
      }
      wrappers.set(key, wrapper);

      return wrapper;
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
  wrappersRef.current = wrappers;

  return stableValue;
}
