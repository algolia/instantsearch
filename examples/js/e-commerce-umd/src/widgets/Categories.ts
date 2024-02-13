import { collapseButtonText } from '../templates/panel';

const { panel, hierarchicalMenu } = window.instantsearch.widgets;
const categoryHierarchicalMenu = panel({
  templates: {
    header() {
      return 'Category';
    },
    collapseButtonText,
  },
  collapsed: () => false,
})(hierarchicalMenu);

export const categories = categoryHierarchicalMenu({
  container: '[data-widget="categories"]',
  attributes: ['hierarchicalCategories.lvl0', 'hierarchicalCategories.lvl1'],
});
