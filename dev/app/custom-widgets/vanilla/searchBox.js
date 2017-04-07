/* eslint-disable import/default */
import instantsearch from '../../../../index.js';

function render(
  {
    query,
    onHistoryChange,
    search,
    widgetParams,
  },
  isFirstRendering,
) {
  const {node} = widgetParams;
  node.search = search;
  if (isFirstRendering) {
    node.placeholder = widgetParams.placeholder;
    node.addEventListener('input', e => node.search(e.target.value));
  }
}

export default instantsearch.connectors.connectSearchBox(render);

