/* eslint-disable import/default */
/* global $ */
import instantsearch from '../../index.js';

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
    container.html('<div class="ais-toggle--header facet-title ais-header">Custom categories</div>')
             .append(input);
  } else {
    input = container.find('select');
  }

  input.refine = opts.refine;

  const facetValues = opts.items.slice(0, opts.widgetParams.limit || 10);
  const facetOptions = facetValues.map(f => f.isRefined ?
      $(`<option value='${f.path}' selected>${f.name}</option>`) :
      $(`<option value='${f.path}'>${f.name}</option>`)
  );
  const isValueSelected = facetValues.find(f => f.isRefined);

  const noValue = $(`<option value='' selected='${!isValueSelected}'></option>`);

  input.html('');

  input.append(noValue);
  if (facetOptions.length > 0) {
    facetOptions.forEach(o => {
      input.append(o);
    });
  }
}

