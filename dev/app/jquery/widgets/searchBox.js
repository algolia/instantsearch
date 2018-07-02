/* eslint-disable import/default */
import instantsearch from '../../../../index';

const renderFn = (
  { query, refine, widgetParams: { inputNode } },
  isFirstRendering
) => {
  if (isFirstRendering) {
    inputNode.on('keyup', () => refine(inputNode.val()));
    inputNode.val(query);
  }
};

export default instantsearch.connectors.connectSearchBox(renderFn);
