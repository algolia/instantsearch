import { expect } from 'vitest';

import type { MatcherResult } from 'vitest';

export function toMatchNormalizedInlineSnapshot(
  this: any,
  received: Element,
  normalizeFn: (html: string) => string,
  snapshot: string = ''
): MatcherResult {
  const normalizedElement = document.createElement('div');
  normalizedElement.innerHTML = normalizeFn(received.outerHTML);

  // Use Vitest's built-in toMatchInlineSnapshot via expect
  try {
    expect(normalizedElement.firstChild).toMatchInlineSnapshot(snapshot);
    return {
      pass: true,
      message: () => 'Snapshot matched',
    };
  } catch (error: any) {
    return {
      pass: false,
      message: () => error.message,
    };
  }
}

declare module 'vitest' {
  interface Assertion<T> {
    /**
     * This ensures that a value matches the inline snapshot after
     * taking into account discrepancies between InstantSearch flavors.
     */
    toMatchNormalizedInlineSnapshot: (
      normalizeFn: (html: string) => string,
      snapshot?: string
    ) => MatcherResult;
  }
}
