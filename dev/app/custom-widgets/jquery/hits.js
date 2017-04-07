/* eslint-disable import/default */
/* global $ */
import instantsearch from '../../../../index.js';

export default instantsearch.connectors.connectHits(customHitsRendering);
function customHitsRendering({hits, widgetParams: {containerNode}}, isFirstRendering) {
  containerNode.html(hits.map( h => `<pre>${JSON.stringify(h)}</pre>`));
}
