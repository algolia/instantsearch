export type MaybePromise<TResolution> =
  | Readonly<Promise<TResolution>>
  | Promise<TResolution>
  | TResolution;

// copied from
// https://github.com/algolia/autocomplete.js/blob/307a7acc4283e10a19cb7d067f04f1bea79dc56f/packages/autocomplete-core/src/utils/createConcurrentSafePromise.ts#L1:L1
/**
 * Creates a runner that executes promises in a concurrent-safe way.
 *
 * This is useful to prevent older promises to resolve after a newer promise,
 * otherwise resulting in stale resolved values.
 */
export function createConcurrentSafePromise<TValue>() {
  let basePromiseId = -1;
  let latestResolvedId = -1;
  let latestResolvedValue: TValue | undefined = undefined;

  return function runConcurrentSafePromise(promise: MaybePromise<TValue>) {
    const currentPromiseId = ++basePromiseId;

    return Promise.resolve(promise).then(x => {
      // The promise might take too long to resolve and get outdated. This would
      // result in resolving stale values.
      // When this happens, we ignore the promise value and return the one
      // coming from the latest resolved value.
      //
      // +----------------------------------+
      // |        100ms                     |
      // | run(1) +--->  R1                 |
      // |        300ms                     |
      // | run(2) +-------------> R2 (SKIP) |
      // |        200ms                     |
      // | run(3) +--------> R3             |
      // +----------------------------------+
      if (latestResolvedValue && currentPromiseId < latestResolvedId) {
        return latestResolvedValue;
      }

      latestResolvedId = currentPromiseId;
      latestResolvedValue = x;

      return x;
    });
  };
}
