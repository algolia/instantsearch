import type { MenuSelectComponentTemplates } from '../../components/MenuSelect/MenuSelect';
import { formatNumber } from '../../lib/formatNumber';

const defaultTemplates: MenuSelectComponentTemplates = {
  item({ label, count }) {
    return `${label} (${formatNumber(String(count))})`;
  },
  defaultOption: 'See all',
};

export default defaultTemplates;
