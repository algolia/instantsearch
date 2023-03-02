import { omit } from '../../lib/utils';

import type { HitsComponentTemplates } from '../../components/Hits/Hits';

const defaultTemplates: HitsComponentTemplates = {
  empty() {
    return 'No results';
  },
  item(data) {
    return JSON.stringify(omit(data, ['__hitIndex']), null, 2);
  },
};

export default defaultTemplates;
