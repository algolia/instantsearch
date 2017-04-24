/* eslint-disable import/default */
import instantsearch from '../../../../index.js';

const renderFn = ({
  options,
  currentRefinement,
  refine,
  widgetParams: {containerNode},
}, isFirstRendering) => {
  if (isFirstRendering) {
    const markup = '<select></select>';
    containerNode.append(markup);
  }

  const optionsHTML = options.map(({value, label}) => `
    <option
      value="${value}"
      ${currentRefinement === value ? 'selected' : ''}
    >
      ${label}
    </option>
  `);

  containerNode
    .find('select')
    .html(optionsHTML);

  containerNode
    .find('select')
    .off('change')
    .on('change', e => { refine(e.target.value); });
};

export default instantsearch.connectors.connectHitsPerPageSelector(renderFn);
