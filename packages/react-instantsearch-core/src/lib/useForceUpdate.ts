'use client';

import { useReducer } from 'react';

/**
 * Forces a React update that triggers a rerender.
 * @link https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
 */
export function useForceUpdate() {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  return forceUpdate;
}
