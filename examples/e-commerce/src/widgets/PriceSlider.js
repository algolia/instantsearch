import { panel, rangeSlider } from 'instantsearch.js/es/widgets';
import { collapseButtonText } from '../templates/panel';

const priceRangeSlider = panel({
  templates: {
    header: 'Price',
    collapseButtonText,
  },
  collapsed: () => false,
  cssClasses: {
    header: 'panel-header',
  },
})(rangeSlider);

const priceSlider = priceRangeSlider({
  container: '[data-widget="price-range"]',
  attribute: 'price',
  pips: false,
  tooltips: {
    format(value) {
      return `${Math.round(value).toLocaleString()}`;
    },
  },
  cssClasses: {
    root: 'range-slider',
  },
});

export default priceSlider;
