/** @jsx h */

import { omit } from 'instantsearch-core';
import { h, Fragment } from 'preact';

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
    return (
      <Fragment>{JSON.stringify(omit(data, ['__hitIndex']), null, 2)}</Fragment>
    );
  },
};

export default defaultTemplates;
