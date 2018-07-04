/* eslint-disable import/default */
import instantsearch from '../../../../index';

const renderFn = (
  { nbHits, processingTimeMS, widgetParams: { containerNode } },
  isFirstRendering
) => {
  if (isFirstRendering) return;
  containerNode.html(`${nbHits} results found in ${processingTimeMS}ms`);
};

export default instantsearch.connectors.connectStats(renderFn);
