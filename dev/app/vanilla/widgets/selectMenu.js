/* eslint-disable import/default */
import instantsearch from '../../../../index';

function render(
  { items, refine, widgetParams: { containerNode, title } },
  isFirstRendering
) {
  let select;
  if (isFirstRendering) {
    const header = document.createElement('div');
    header.innerText = title;
    containerNode.appendChild(header);
    select = document.createElement('select');

    select.addEventListener('change', e => refine(e.target.value));

    containerNode.appendChild(select);
  } else {
    select = containerNode.querySelector('select');
  }

  const options = items.map(item => {
    const option = document.createElement('option');

    option.innerText = `${item.label} ${item.count}`;
    option.value = item.value;
    option.selected = item.isRefined;

    return option;
  });

  select.textContent = '';
  options.forEach(el => select.appendChild(el));
}

export default instantsearch.connectors.connectMenu(render);
