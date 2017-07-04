/* eslint-disable import/default */
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
    const containingForm = document.createElement('form');
    node.parentNode.appendChild(containingForm);
    node.placeholder = widgetParams.placeholder;

    containingForm.appendChild(node);

    containingForm.addEventListener('submit', e => {
      e.preventDefault();
      refine(node.value);
    });
  }
}

export default connectSearchBox(render);
