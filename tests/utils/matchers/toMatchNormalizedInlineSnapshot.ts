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

export function toMatchNormalizedSnapshot(
  this: any,
  received: Element,
  normalizeFn: (html: string) => string,
  _snapshot?: string
): MatcherResult {
  const normalizedElement = document.createElement('div');
  normalizedElement.innerHTML = normalizeFn(received.outerHTML);

  try {
    expect(normalizedElement.firstChild).toMatchSnapshot();
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/naming-convention
  interface Assertion<T> {
    /**
     * This ensures that a value matches the inline snapshot after
     * taking into account discrepancies between InstantSearch flavors.
     */
    toMatchNormalizedInlineSnapshot: (
      normalizeFn: (html: string) => string,
      snapshot?: string
    ) => MatcherResult;
    /**
     * This ensures that a value matches the file-based snapshot after
     * taking into account discrepancies between InstantSearch flavors.
     * Used in shared test suites that run across multiple flavors.
     */
    toMatchNormalizedSnapshot: (
      normalizeFn: (html: string) => string
    ) => MatcherResult;
  }
}
