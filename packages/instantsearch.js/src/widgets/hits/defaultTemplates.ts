import { omit } from '../../lib/utils';

import type { HitsTemplates } from './hits';

const defaultTemplates = {
  empty() {
    return 'No results';
  },
  item(data) {
    return JSON.stringify(omit(data, ['__hitIndex']), null, 2);
  },
} satisfies HitsTemplates;

export default defaultTemplates;
