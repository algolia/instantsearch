/* eslint-disable import/default */
/* global $ */
import instantsearch from '../../../../index';

export default instantsearch.connectors.connectMenu(customMenuRendering);
function customMenuRendering(opts, isFirstRendering) {
  const container = opts.widgetParams.containerNode;

  let input;
  if (isFirstRendering) {
    input = $('<select></select>');
    input.refine = opts.refine;
    input.on('change', e => {
      input.refine(e.target.value);
    });
    container
      .html(
        '<div class="ais-toggle--header facet-title ais-header">Custom categories</div>'
      )
      .append(input);
  } else {
    input = container.find('select');
  }

  input.refine = opts.refine;

  const facetValues = opts.items.slice(0, opts.widgetParams.limit || 10);
  const facetOptions = facetValues.map(
    f =>
      f.isRefined
        ? $(`<option value='${f.value}' selected>${f.label}</option>`)
        : $(`<option value='${f.value}'>${f.label}</option>`)
  );
  const isValueSelected = facetValues.find(f => f.isRefined);

  const noValue = $(
    `<option value='' selected='${!isValueSelected}'></option>`
  );

  input.html('');

  input.append(noValue);
  if (facetOptions.length > 0) {
    facetOptions.forEach(o => {
      input.append(o);
    });
  }
}
