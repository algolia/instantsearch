/* eslint-disable import/default */
import instantsearch from '../../../../index.js';

const renderFn = (
  { indices, refine, widgetParams: { containerNode } },
  isFirstRendering
) => {
  if (isFirstRendering) {
    containerNode.html(`
      <strong>Search for a brand:</strong>
      <select id="ais-autocomplete"></select>
    `);

    containerNode.find('select').selectize({
      options: [],

      valueField: 'brand',
      labelField: 'brand',
      searchField: 'brand',

      highlight: false,

      onType: refine,

      onChange: refine,
    });
  }

  if (!isFirstRendering && indices[0].results) {
    const autocompleteInstance = containerNode.find('select')[0].selectize;

    indices[0].results.hits.forEach(h => autocompleteInstance.addOption(h));
    autocompleteInstance.refreshOptions(autocompleteInstance.isOpen);
  }
};

export default instantsearch.connectors.connectAutocomplete(renderFn);
