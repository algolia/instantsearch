import { panel, rangeSlider } from 'instantsearch.js/es/widgets';

import { collapseButtonText } from '../templates/panel';

const priceRangeSlider = panel({
  templates: {
    header() {
      return 'Price';
    },
    collapseButtonText,
  },
  collapsed: () => false,
})(rangeSlider);

export const priceSlider = priceRangeSlider({
  container: '[data-widget="price-range"]',
  attribute: 'price',
  pips: false,
  tooltips: {
    format(value: number) {
      return `${Math.round(value).toLocaleString()}`;
    },
  },
});
