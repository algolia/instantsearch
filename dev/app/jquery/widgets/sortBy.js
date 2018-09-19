/* eslint-disable import/default */
import instantsearch from '../../../../index.js';

const renderFn = (
  { options, refine, currentRefinement, widgetParams: { containerNode } },
  isFirstRendering
) => {
  if (isFirstRendering) {
    containerNode.append('<select></select>');
    containerNode
      .find('select')
      .on('change', ({ target: { value } }) => refine(value));
  }

  const optionsHTML = options.map(
    ({ label, value }) => `
    <option
      value="${value}"
      ${currentRefinement === value ? 'selected' : ''}
    >
      ${label}
    </option>
  `
  );

  containerNode.find('select').html(optionsHTML);
};

export default instantsearch.connectors.connectSortBy(renderFn);
