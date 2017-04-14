/* eslint-disable import/default */
import instantsearch from '../../../../index.js';

const renderFn = ({
  refine,
  hasRefinements,
  createURL,
  widgetParams: {containerNode},
}, isFirstRendering) => {
  if (isFirstRendering) {
    const markup = window.$('<button id="custom-clear-all">Clear All</button>');
    containerNode.append(markup);

    markup
      .on('click', e => hasRefinements ? refine() : e.preventDefault());
  }
  const clearAllCTA = containerNode.find('#custom-clear-all');

  // disable button
  clearAllCTA.attr('disabled', !hasRefinements);
};

export default instantsearch.connectors.connectClearAll(renderFn);
