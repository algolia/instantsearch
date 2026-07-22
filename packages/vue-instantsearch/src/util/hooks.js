/**
 * A minimal React/Preact-style hooks runtime that a Vue component drives
 * through its own render cycle.
 *
 * The shared `instantsearch-ui-components` factories (e.g.
 * `createAutocompletePropGetters`) are written against a React-style `Hooks`
 * contract (`useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`,
 * `useId`). React and Preact satisfy it natively; Vue does not. This store
 * reimplements the pieces those factories rely on so a Vue component can
 * consume the shared logic instead of reimplementing it.
 *
 * Usage from a Vue component:
 *
 *   created() {
 *     this.hooksStore = createHooksStore(() => this.$forceUpdate());
 *   },
 *   render(h) {
 *     this.hooksStore.beginRender();
 *     const result = usePropGetters(...);   // calls the hooks
 *     this.hooksStore.endRender();
 *     return renderTree(result);
 *   },
 *   mounted() { this.hooksStore.flushEffects(); },
 *   updated() { this.hooksStore.flushEffects(); },
 *   beforeDestroy() { this.hooksStore.cleanup(); }
 *
 * PROOF-OF-CONCEPT: this validates whether Vue can drive React-style hooks.
 * It intentionally does not (yet) cover `useLayoutEffect` or `memo`.
 */
export function createHooksStore(scheduleRender) {
  // One cell per hook call site, keyed by call order within a render pass.
  const cells = [];
  let cursor = 0;
  let idCounter = 0;
  // Effects whose deps changed during the current render, flushed post-commit.
  let pendingEffects = [];

  function beginRender() {
    cursor = 0;
    pendingEffects = [];
  }

  function endRender() {
    // no-op for now; kept for symmetry and future hook-order validation
  }

  function flushEffects() {
    const effects = pendingEffects;
    pendingEffects = [];
    effects.forEach((cell) => {
      if (typeof cell.cleanup === 'function') {
        cell.cleanup();
      }
      const cleanup = cell.effect();
      cell.cleanup = typeof cleanup === 'function' ? cleanup : undefined;
    });
  }

  function cleanup() {
    cells.forEach((cell) => {
      if (cell && typeof cell.cleanup === 'function') {
        cell.cleanup();
      }
    });
  }

  const useState = (initialState) => {
    const index = cursor++;
    if (cells[index] === undefined) {
      cells[index] = {
        value:
          typeof initialState === 'function' ? initialState() : initialState,
      };
    }
    const cell = cells[index];
    const setState = (next) => {
      const nextValue = typeof next === 'function' ? next(cell.value) : next;
      if (Object.is(nextValue, cell.value)) {
        return;
      }
      cell.value = nextValue;
      scheduleRender();
    };
    return [cell.value, setState];
  };

  const useRef = (initialValue) => {
    const index = cursor++;
    if (cells[index] === undefined) {
      cells[index] = { value: { current: initialValue } };
    }
    return cells[index].value;
  };

  const useMemo = (factory, deps) => {
    const index = cursor++;
    const cell = cells[index];
    if (cell === undefined || !areDepsEqual(cell.deps, deps)) {
      cells[index] = { value: factory(), deps };
    }
    return cells[index].value;
  };

  const useCallback = (callback, deps) => useMemo(() => callback, deps);

  const useId = () => {
    const index = cursor++;
    if (cells[index] === undefined) {
      cells[index] = { value: `aisVueHook${(idCounter++).toString(36)}` };
    }
    return cells[index].value;
  };

  const useEffect = (effect, deps) => {
    const index = cursor++;
    const cell = cells[index];
    if (cell === undefined) {
      const created = { effect, deps, cleanup: undefined };
      cells[index] = created;
      pendingEffects.push(created);
    } else if (deps === undefined || !areDepsEqual(cell.deps, deps)) {
      cell.effect = effect;
      cell.deps = deps;
      pendingEffects.push(cell);
    }
  };

  // `memo(component, propsAreEqual?)` — the React/Preact HOC that skips
  // re-rendering when props are shallow-equal. In this eager-invocation model
  // it's an identity passthrough: functionally correct (same output), it only
  // forgoes the streaming re-render optimization. A real per-key memo is a
  // future optimization (see the vue-instantsearch chat notes).
  const memo = (component) => component;

  return {
    hooks: { useState, useEffect, useRef, useMemo, useCallback, useId, memo },
    beginRender,
    endRender,
    flushEffects,
    cleanup,
  };
}

function areDepsEqual(prevDeps, nextDeps) {
  if (prevDeps === undefined || nextDeps === undefined) {
    return false;
  }
  if (prevDeps.length !== nextDeps.length) {
    return false;
  }
  for (let i = 0; i < prevDeps.length; i++) {
    if (!Object.is(prevDeps[i], nextDeps[i])) {
      return false;
    }
  }
  return true;
}
