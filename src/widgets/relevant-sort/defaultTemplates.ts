import type { RelevantSortComponentTemplates } from '../../components/RelevantSort/RelevantSort';

const defaultTemplates: RelevantSortComponentTemplates = {
  text: '',
  button: ({ isRelevantSorted }) =>
    isRelevantSorted ? 'See all results' : 'See relevant results',
};

export default defaultTemplates;
