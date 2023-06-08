import { toMatchInlineSnapshot } from 'jest-snapshot';

export function toMatchNormalizedInlineSnapshot(
  this: any,
  received: Element,
  normalizeFn: (html: string) => string,
  snapshot: string = ''
): jest.CustomMatcherResult {
  const normalizedElement = received.cloneNode() as Element;
  normalizedElement.innerHTML = normalizeFn(received.innerHTML);

  return toMatchInlineSnapshot.call(this, normalizedElement, snapshot);
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/naming-convention
    interface Matchers<R> {
      /**
       * This ensures that a value matches the inline snapshot after
       * taking into account discrepancies between InstantSearch flavors.
       */
      toMatchNormalizedInlineSnapshot: (
        normalizeFn: (html: string) => string,
        snapshot?: string
      ) => jest.CustomMatcherResult;
    }
  }
}
