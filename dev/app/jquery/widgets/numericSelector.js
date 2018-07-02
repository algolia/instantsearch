/* eslint-disable import/default */
import instantsearch from '../../../../index';

const renderFn = (
  { currentRefinement, options, refine, widgetParams: { containerNode } },
  isFirstRendering
) => {
  if (isFirstRendering) {
    const markup = '<select></select>';
    containerNode.append(markup);
  }

  const optionsHTML = options.map(
    ({ value, label }) => `
    <option
      value="${value}"
      ${currentRefinement === value ? 'selected' : ''}
    >
      ${label}
    </option>
  `
  );

  containerNode.find('select').html(optionsHTML);

  containerNode
    .find('select')
    .off('change')
    .on('change', e => {
      refine(e.target.value);
    });
};

export default instantsearch.connectors.connectNumericSelector(renderFn);
