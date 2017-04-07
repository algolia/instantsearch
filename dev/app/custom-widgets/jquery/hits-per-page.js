/* eslint-disable import/default */
/* global $ */
import instantsearch from '../../../../index.js';

export default instantsearch.connectors.connectHitsPerPageSelector(customHitsPerPageRendering);
function customHitsPerPageRendering({
  options,
  currentRefinement,
  refine,
  hasNoResults,
  widgetParams: {
    containerNode,
  },
}, isFirstRendering) {
  let input;
  if (isFirstRendering) {
    input = $('<select></select>');
    input.refine = refine;
    input.on('change', e => {
      input.refine(e.target.value);
    });
    containerNode.html('<div class="ais-toggle--header facet-title ais-header">Custom categories</div>')
             .append(input);
  } else {
    input = containerNode.find('select');
  }

  input.refine = refine;

  // options rendering
  const domOptions = options.map(
    o => o.value === currentRefinement ?
      $(`<option value='${o.value}' selected>${o.label}</option>`) :
      $(`<option value='${o.value}'>${o.label}</option>`));

  const noValueOption = currentRefinement ?
      $('<option value=""></option>') :
      $('<option value="" selected></option>');

  input.html('');

  input.append(noValueOption);
  domOptions.forEach(o => input.append(o));
}
