// false positive lint error
// eslint-disable-next-line typescript/consistent-type-imports
import type { HitsTemplates } from './hits';

// The default `item` rendering lives in `instantsearch-ui-components`
// (see `createHitsComponent`), shared with the other flavors.
const defaultTemplates = {
  empty() {
    return 'No results';
  },
} satisfies HitsTemplates;

export default defaultTemplates;
