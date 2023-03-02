import { formatNumber } from '../../lib/formatNumber';

import type { MenuSelectComponentTemplates } from '../../components/MenuSelect/MenuSelect';

const defaultTemplates: MenuSelectComponentTemplates = {
  item({ label, count }) {
    return `${label} (${formatNumber(count)})`;
  },
  defaultOption() {
    return 'See all';
  },
};

export default defaultTemplates;
