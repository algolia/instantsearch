import search from './search';
import { spyCssClassMutationsAndCopy } from './ui';

const rangeInput = document.querySelector('#price-input > .ais-Panel');
const rangeSlider = document.querySelector('#price-range > .ais-Panel');
spyCssClassMutationsAndCopy({ source: rangeInput, target: rangeSlider });

search.start();
