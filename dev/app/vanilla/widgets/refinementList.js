/* eslint-disable import/default */
import instantsearch from '../../../../index';

function render(
  { items, refine, widgetParams: { containerNode } },
  isFirstRendering
) {
  let ul;
  if (isFirstRendering) {
    containerNode.className = 'ais-root ais-refinement-list';

    const header = document.createElement('div');
    header.className = 'ais-refinement-list--header facet-title ais-header';
    header.innerText = 'Brands';
    containerNode.appendChild(header);

    ul = document.createElement('ul');
    ul.className = 'ais-body ais-refinement-list--body';
    containerNode.appendChild(ul);
  } else {
    ul = containerNode.querySelector('ul');
  }

  const elements = items.map(item => {
    const li = document.createElement('li');

    const label = document.createElement('label');
    label.className = 'ais-refinement-list--label';
    li.appendChild(label);

    const check = document.createElement('input');
    check.type = 'checkbox';
    check.className = 'ais-refinement-list--checkbox';
    if (item.isRefined) check.checked = 'checked';
    label.appendChild(check);

    check.addEventListener('change', () => {
      refine(item.value);
    });

    const span = document.createElement('span');
    span.innerText = item.label;
    label.appendChild(span);

    const count = document.createElement('span');
    count.className = 'ais-refinement-list--count facet-count pull-right';
    count.innerText = item.count;
    label.appendChild(count);

    return li;
  });
  ul.textContent = '';
  elements.forEach(el => ul.appendChild(el));
}

export default instantsearch.connectors.connectRefinementList(render);
