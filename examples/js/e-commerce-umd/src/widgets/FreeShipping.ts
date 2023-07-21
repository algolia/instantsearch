import { collapseButtonText } from '../templates/panel';

const { panel, toggleRefinement } = window.instantsearch.widgets;
const freeShippingToggleRefinement = panel({
  templates: {
    header: 'Free shipping',
    collapseButtonText,
  },
  collapsed: () => false,
})(toggleRefinement);

export const freeShipping = freeShippingToggleRefinement({
  container: '[data-widget="free-shipping"]',
  attribute: 'free_shipping',
  templates: {
    labelText: 'Display only items with free shipping',
  },
});
