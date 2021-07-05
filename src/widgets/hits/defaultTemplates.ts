import { HitsComponentTemplates } from '../../components/Hits/Hits';

const defaultTemplates: HitsComponentTemplates = {
  empty: 'No results',
  item(data) {
    return JSON.stringify(data, null, 2);
  },
};

export default defaultTemplates;
