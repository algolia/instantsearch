import type { FrequentlyBoughtTogetherTemplates } from './frequently-bought-together';

const defaultTemplates: Required<FrequentlyBoughtTogetherTemplates> = {
  empty() {
    return 'No results';
  },
  header({ translations }) {
    return translations.title || null;
  },
  item(data) {
    return JSON.stringify(data, null, 2);
  },
};

export default defaultTemplates;
