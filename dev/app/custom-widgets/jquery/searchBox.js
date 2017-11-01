/* eslint-disable import/default */
import instantsearch from '../../../../index.js';

const renderFn = (
  {
    query,
    refine,
    widgetParams: { inputNode },
    onStalledSearch,
    onSearchQueueEmpty,
  },
  isFirstRendering
) => {
  if (isFirstRendering) {
    inputNode.on('keyup', () => refine(inputNode.val()));
    inputNode.val(query);
    onStalledSearch(() => {
      inputNode.addClass('stalled-search');
    });
    onSearchQueueEmpty(() => {
      inputNode.removeClass('stalled-search');
    });
  }
};

export default instantsearch.connectors.connectSearchBox(renderFn);
