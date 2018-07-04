/* eslint-disable import/default */
import instantsearch from '../../../../index';

const renderFn = (
  { refine, hasRefinements, widgetParams: { containerNode } },
  isFirstRendering
) => {
  if (isFirstRendering) {
    const markup = window.$('<button id="custom-clear-all">Clear All</button>');
    containerNode.append(markup);

    markup.on('click', e => {
      e.preventDefault();
      refine();
    });
  }
  const clearAllCTA = containerNode.find('#custom-clear-all');

  // disable button
  clearAllCTA.attr('disabled', !hasRefinements);
};

export default instantsearch.connectors.connectClearRefinements(renderFn);
