import {connectSortBySelector} from '../../../../index.es6.js';

const renderFn = ({
  options,
  refine,
  hasNoResults,
  currentRefinement,
  widgetParams: {containerNode},
}, isFirstRendering) => {
  if (isFirstRendering) {
    containerNode.append('<select></select>');
    containerNode
      .find('select')
      .on('change', ({target: {value}}) => refine(value));
  }

  const optionsHTML = options.map(({label, value}) => `
    <option
      value="${value}"
      ${currentRefinement === value ? 'selected' : ''}
    >
      ${label}
    </option>
  `);

  containerNode.find('select').html(optionsHTML);
};

export default connectSortBySelector(renderFn);
