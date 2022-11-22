import type { MenuSelectComponentTemplates } from '../../components/MenuSelect/MenuSelect';
import { formatNumber } from '../../lib/formatNumber';

const defaultTemplates: MenuSelectComponentTemplates = {
  item({ label, count }) {
    return `${label} (${formatNumber(count)})`;
  },
  defaultOption() {
    return 'See all';
  },
};

export default defaultTemplates;
