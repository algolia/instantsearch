import type { InstantSearch as InstantSearchInterface } from 'instantsearch-core';

import InstantSearch from '../InstantSearch';

type InstantSearchInstance = InstanceType<typeof InstantSearch>;

/**
 * Compile-time guard: the runtime class must structurally satisfy the
 * `InstantSearch` interface exported from `instantsearch-core`.
 */
type InstantSearchSatisfiesCore = InstantSearchInstance extends InstantSearchInterface<
  any,
  any
>
  ? true
  : false;

const _instantSearchSatisfiesCoreInterface: InstantSearchSatisfiesCore = true;

test('InstantSearch runtime class satisfies instantsearch-core InstantSearch interface', () => {
  expect(_instantSearchSatisfiesCoreInterface).toBe(true);
});
