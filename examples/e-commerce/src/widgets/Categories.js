import { panel, hierarchicalMenu } from 'instantsearch.js/es/widgets';
import { collapseButtonText } from '../templates/panel';

const categoryHierarchicalMenu = panel({
  templates: {
    header: 'Category',
    collapseButtonText,
  },
  collapsed: () => false,
  cssClasses: {
    header: 'panel-header',
  },
})(hierarchicalMenu);

const categories = categoryHierarchicalMenu({
  container: '#categories',
  attributes: ['hierarchicalCategories.lvl0', 'hierarchicalCategories.lvl1'],
});

export default categories;
