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
  container: '[data-widget="categories"]',
  attributes: ['hierarchicalCategories.lvl0', 'hierarchicalCategories.lvl1'],
  cssClasses: {
    link: 'hierarchical-menu-link',
  },
});

export default categories;
