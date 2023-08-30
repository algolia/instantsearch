import { useEffect, useLayoutEffect } from 'react';

/**
 * `useLayoutEffect` that doesn't show a warning when server-side rendering.
 *
 * It uses `useEffect` on the server (no-op), and `useLayoutEffect` on the browser.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
