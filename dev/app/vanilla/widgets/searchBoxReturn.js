/* eslint-disable import/default */
import instantsearch from '../../../../index';

function render({ refine, widgetParams }, isFirstRendering) {
  const { node } = widgetParams;

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

export default instantsearch.connectors.connectSearchBox(render);
