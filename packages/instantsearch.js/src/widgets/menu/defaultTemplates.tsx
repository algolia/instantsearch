// false positive lint error
// eslint-disable-next-line typescript/consistent-type-imports
import type { MenuTemplates } from './menu';

// The default `item` rendering lives in `instantsearch-ui-components`
// (see `createMenuComponent`), shared with the other flavors.
const defaultTemplates = {
  showMoreText({ isShowingMore }: { isShowingMore: boolean }) {
    return isShowingMore ? 'Show less' : 'Show more';
  },
} satisfies MenuTemplates;

export default defaultTemplates;
