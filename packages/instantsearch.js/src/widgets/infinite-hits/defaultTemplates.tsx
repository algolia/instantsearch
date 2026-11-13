import type { InfiniteHitsTemplates } from './infinite-hits';

// The default `item` rendering lives in `instantsearch-ui-components`
// (see `createInfiniteHitsComponent`), shared with the other flavors.
const defaultTemplates: InfiniteHitsTemplates = {
  empty() {
    return 'No results';
  },
  showPreviousText() {
    return 'Show previous results';
  },
  showMoreText() {
    return 'Show more results';
  },
};

export default defaultTemplates;
