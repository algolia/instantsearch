/* eslint-disable import/default */
import instantsearch from '../../index.js';

const renderFn = ({
  clearAll,
  hasRefinements,
  createURL,
  widgetParams: {containerNode},
}, isFirstRendering) => {
  if (isFirstRendering) {
    const markup = window.$('<button id="custom-clear-all">Clear All</button>');
    containerNode.append(markup);
  }

  const clearAllCTA = containerNode.find('#custom-clear-all');

  // bind click event
  clearAllCTA
    .off('click')
    .on('click', e => hasRefinements ? clearAll() : e.preventDefault());

  // disable button
  clearAllCTA.attr('disabled', !hasRefinements);
};

export default instantsearch.connectors.connectClearAll(renderFn);
