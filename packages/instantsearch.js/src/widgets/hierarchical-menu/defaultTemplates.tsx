// false positive lint error
// eslint-disable-next-line typescript/consistent-type-imports
import type { HierarchicalMenuTemplates } from './hierarchical-menu';

// The default `item` rendering lives in `instantsearch-ui-components`
// (see `createHierarchicalMenuComponent`), shared with the other flavors.
const defaultTemplates = {
  showMoreText({ isShowingMore }: { isShowingMore: boolean }) {
    return isShowingMore ? 'Show less' : 'Show more';
  },
} satisfies HierarchicalMenuTemplates;

export default defaultTemplates;
