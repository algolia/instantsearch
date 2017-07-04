import {connectHitsPerPage} from '../../../../index.es6.js';

const renderFn = ({
  items,
  refine,
  widgetParams: {containerNode},
}, isFirstRendering) => {
  if (isFirstRendering) {
    const markup = '<select></select>';
    containerNode.append(markup);
  }

  const itemsHTML = items.map(({value, label, isRefined}) => `
    <option
      value="${value}"
      ${isRefined ? 'selected' : ''}
    >
      ${label}
    </option>
  `);

  containerNode
    .find('select')
    .html(itemsHTML);

  containerNode
    .find('select')
    .off('change')
    .on('change', e => { refine(e.target.value); });
};

export default connectHitsPerPage(renderFn);
