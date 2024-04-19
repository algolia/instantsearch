import type { RelatedProductsTemplates } from './related-products';

const defaultTemplates: Required<RelatedProductsTemplates> = {
  empty() {
    return 'No results';
  },
  header() {
    return null;
  },
  item(data) {
    return JSON.stringify(data, null, 2);
  },
};

export default defaultTemplates;
