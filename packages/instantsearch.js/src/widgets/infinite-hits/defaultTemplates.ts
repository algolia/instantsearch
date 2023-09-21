import { omit } from '../../lib/utils';

import type { InfiniteHitsComponentTemplates } from '../../components/InfiniteHits/InfiniteHits';

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
    return JSON.stringify(omit(data, ['__hitIndex']), null, 2);
  },
};

export default defaultTemplates;
