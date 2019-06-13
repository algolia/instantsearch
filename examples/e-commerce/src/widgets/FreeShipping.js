import { panel, toggleRefinement } from 'instantsearch.js/es/widgets';
import { collapseButtonText } from '../templates/panel';

const freeShippingToggleRefinement = panel({
  templates: {
    header: 'Free shipping',
    collapseButtonText,
  },
  collapsed: () => false,
  cssClasses: {
    header: 'panel-header',
  },
})(toggleRefinement);

const freeShipping = freeShippingToggleRefinement({
  container: '#shipping',
  attribute: 'free_shipping',
  templates: {
    labelText: 'Display only items with free shipping',
  },
  cssClasses: {
    label: 'toggle-refinement-label',
    checkbox: 'toggle-refinement-checkbox',
  },
});

export default freeShipping;
