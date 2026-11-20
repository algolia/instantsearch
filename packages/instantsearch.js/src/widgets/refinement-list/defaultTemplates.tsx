// false positive lint error
// eslint-disable-next-line typescript/consistent-type-imports
import type { RefinementListOwnTemplates } from './refinement-list';

// The default `item` rendering lives in `instantsearch-ui-components`
// (see `createRefinementListComponent`), shared with the other flavors.
const defaultTemplates = {
  showMoreText({ isShowingMore }: { isShowingMore: boolean }) {
    return isShowingMore ? 'Show less' : 'Show more';
  },
  searchableNoResults() {
    return 'No results.';
  },
} satisfies RefinementListOwnTemplates;

export default defaultTemplates;
