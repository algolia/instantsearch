import {connectStats} from '../../../../index.es6.js';

const renderFn = ({
  nbHits,
  processingTimeMS,
  widgetParams: {containerNode},
}, isFirstRendering) => {
  if (isFirstRendering) return;
  containerNode.html(`${nbHits} results found in ${processingTimeMS}ms`);
};

export default connectStats(renderFn);
