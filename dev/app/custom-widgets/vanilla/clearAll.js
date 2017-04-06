/* eslint-disable import/default */

import instantsearch from '../../';

export default instantsearch.connectors.connectClearAll(render);

function render(
  {
    clearAll,
    widgetParams,
  },
  isFirstRendering,
) {
  let button;
  if (isFirstRendering) {
    button = document.createElement('button');
    button.clearAll = clearAll;
    button.innerText = 'clear';
    widgetParams.containerNode.appendChild(button);
    button.addEventListener('click', () => button.clearAll());
  } else {
    button = widgetParams.containerNode.querySelector('button');
    button.clearAll = clearAll;
  }
}
