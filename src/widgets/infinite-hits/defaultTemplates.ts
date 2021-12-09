import type { InfiniteHitsComponentTemplates } from '../../components/InfiniteHits/InfiniteHits';

const defaultTemplates: InfiniteHitsComponentTemplates = {
  empty: 'No results',
  showPreviousText: 'Show previous results',
  showMoreText: 'Show more results',
  item(data) {
    return JSON.stringify(data, null, 2);
  },
};

export default defaultTemplates;
