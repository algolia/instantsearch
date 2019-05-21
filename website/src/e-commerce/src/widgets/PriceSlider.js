import { panel, rangeSlider } from 'instantsearch.js/es/widgets';

// The price range slider has a dummy panel to be collapsed
// at the same time as `rangeInput`.
const priceRangeSlider = panel({})(rangeSlider);

const priceSlider = priceRangeSlider({
  container: '#price-range',
  attribute: 'price',
  pips: false,
});

export default priceSlider;
