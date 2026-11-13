/** @jsx h */

import { omit } from 'instantsearch-core/internal';
import { createDefaultHitComponent } from 'instantsearch-ui-components';
import { h, Fragment } from 'preact';

import type { InfiniteHitsComponentTemplates } from '../../components/InfiniteHits/InfiniteHits';

const DefaultHit = createDefaultHitComponent({ createElement: h, Fragment });

const defaultTemplates: InfiniteHitsComponentTemplates = {
  empty() {
    return 'No results';
  },
  showPreviousText() {
    return 'Show previous results';
  },
  showMoreText() {
    return 'Show more results';
  },
  item(data) {
    return <DefaultHit hit={omit(data, ['__hitIndex'])} />;
  },
};

export default defaultTemplates;
