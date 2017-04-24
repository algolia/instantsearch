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
    const containingForm = document.createElement('form');
    node.parentNode.appendChild(containingForm);
    node.placeholder = widgetParams.placeholder;

    containingForm.appendChild(node);

    containingForm.addEventListener('submit', e => {
      e.preventDefault();
      node.search(node.value);
    });
  }
}

export default instantsearch.connectors.connectSearchBox(render);

