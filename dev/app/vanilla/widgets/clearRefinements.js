/* eslint-disable import/default */
import instantsearch from '../../../../index.js';

export default instantsearch.connectors.connectClearRefinements(render);

function render({ refine, widgetParams }, isFirstRendering) {
  let button;
  if (isFirstRendering) {
    button = document.createElement('button');
    button.innerText = 'clear';
    widgetParams.containerNode.appendChild(button);
    button.addEventListener('click', () => refine());
  }
}
