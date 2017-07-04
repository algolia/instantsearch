import {connectSearchBox} from '../../../../index.es6.js';

function render(
  {
    query,
    onHistoryChange,
    refine,
    widgetParams,
  },
  isFirstRendering,
) {
  const {node} = widgetParams;
  if (isFirstRendering) {
    node.placeholder = widgetParams.placeholder;
    node.addEventListener('input', e => refine(e.target.value));
  }
}

export default connectSearchBox(render);
