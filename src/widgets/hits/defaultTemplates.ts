import type { HitsComponentTemplates } from '../../components/Hits/Hits.js';

const defaultTemplates: HitsComponentTemplates = {
  empty: 'No results',
  item(data) {
    return JSON.stringify(data, null, 2);
  },
};

export default defaultTemplates;
