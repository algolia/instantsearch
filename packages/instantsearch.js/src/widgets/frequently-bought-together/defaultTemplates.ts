//  import { omit } from '../../lib/utils';

import type { FrequentlyBoughtTogetherTemplates } from './frequently-bought-together';

const defaultTemplates: Required<FrequentlyBoughtTogetherTemplates> = {
  empty() {
    return 'No results';
  },
  item(data) {
    return data.objectID; // temporary
    // return JSON.stringify(omit(, ['__hitIndex']), null, 2);
  },
};

export default defaultTemplates;
