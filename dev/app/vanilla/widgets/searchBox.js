/* eslint-disable import/default */
import instantsearch from '../../../../index';

function render({ refine, widgetParams }, isFirstRendering) {
  const { node } = widgetParams;
  if (isFirstRendering) {
    node.placeholder = widgetParams.placeholder;
    node.addEventListener('input', e => refine(e.target.value));
  }
}

export default instantsearch.connectors.connectSearchBox(render);
