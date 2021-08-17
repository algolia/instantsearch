import { MenuSelectComponentTemplates } from '../../components/MenuSelect/MenuSelect';

const defaultTemplates: MenuSelectComponentTemplates = {
  item: '{{label}} ({{#helpers.formatNumber}}{{count}}{{/helpers.formatNumber}})',
  defaultOption: 'See all',
};

export default defaultTemplates;
