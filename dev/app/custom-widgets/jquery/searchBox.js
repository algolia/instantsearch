/* eslint-disable import/default */
import instantsearch from '../../../../index.js';

const renderFn = ({
  query,
  onHistoryChange,
  refine,
  widgetParams: {inputNode},
}, isFirstRendering) => {
  if (isFirstRendering) {
    inputNode.on('keyup', () => refine(inputNode.val()));
    inputNode.val(query);
  }
};

export default instantsearch.connectors.connectSearchBox(renderFn);
