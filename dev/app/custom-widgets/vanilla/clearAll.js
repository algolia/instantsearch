import {connectClearAll} from '../../../../index.es6.js';

function render({refine, widgetParams}, isFirstRendering) {
  let button;
  if (isFirstRendering) {
    button = document.createElement('button');
    button.innerText = 'clear';
    widgetParams.containerNode.appendChild(button);
    button.addEventListener('click', () => refine());
  }
}

export default connectClearAll(render);
