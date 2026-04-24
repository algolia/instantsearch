/** @jsx h */

import { h, Fragment } from 'preact';

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
    return (
      <Fragment>{JSON.stringify(omit(data, ['__hitIndex']), null, 2)}</Fragment>
    );
  },
};

export default defaultTemplates;
