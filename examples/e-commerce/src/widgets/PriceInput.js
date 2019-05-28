import { panel, rangeInput } from 'instantsearch.js/es/widgets';
import { collapseButtonText } from '../templates/panel';

const priceRangeInput = panel({
  templates: {
    header: 'Price',
    collapseButtonText,
  },
  collapsed: () => false,
  cssClasses: {
    header: 'panel-header',
  },
})(rangeInput);

const priceInput = priceRangeInput({
  container: '#price-input',
  attribute: 'price',
  templates: {
    separatorText: '—',
  },
  cssClasses: {
    label: 'range-input-label',
    input: 'range-input-input',
    separator: 'range-input-separator',
    submit: 'range-input-submit',
  },
});

export default priceInput;
