import type { InstantSearch } from 'instantsearch.js';
import type { IndexWidget } from 'instantsearch.js/es/widgets/index/index';

/**
 * Where a widget mounts: an InstantSearch instance and one of its indices.
 *
 * `<InstantSearch>` and `<Index>` yield one, so the components they yield
 * have it already. A component that is imported on its own
 * takes it as `@parent`.
 */
export interface Parent {
  search: InstantSearch;
  index: IndexWidget;
}
