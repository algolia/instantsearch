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
  item(data, { html }) {
    return html`<div style="word-break: break-all;">
      ${JSON.stringify(data).slice(0, 100)}…
    </div>`;
  },
};

export default defaultTemplates;
