import type { RelevantSortComponentTemplates } from '../../components/RelevantSort/RelevantSort';

const defaultTemplates: RelevantSortComponentTemplates = {
  text() {
    return '';
  },
  button({ isRelevantSorted }) {
    return isRelevantSorted ? 'See all results' : 'See relevant results';
  },
};

export default defaultTemplates;
