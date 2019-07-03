import { panel, toggleRefinement } from 'instantsearch.js/es/widgets';
import { collapseButtonText } from '../templates/panel';

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
