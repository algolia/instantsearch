import { collapseButtonText } from '../templates/panel';

const { panel, rangeSlider } = window.instantsearch.widgets;
const priceRangeSlider = panel({
  templates: {
    header: 'Price',
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
