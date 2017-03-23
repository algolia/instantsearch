import {checkRendering} from '../../lib/utils.js';

const usage = `Usage:
var customHits = connectHits(function render(params, isFirstRendering) {
  // params = {
  //   hits,
  //   results,
  //   instantSearchInstance,
  // }
});
search.addWidget(
  customHits({
    [ hitsPerPage = 20 ]
  });
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectHits.html
`;

/**
 * @typedef {Object} CustomHitsWidgetOptions
 * @param {number} [hitsPerPage = 20] The number of hits to display per page
 */

/**
 * @typedef HitsRenderingOptions
 * @property {Object[]} hits
 * @property {Object} results
 * @property {InstantSearch} instantSearchInstance
 */

 /**
  * Connects a rendering function with the hits business logic.
  * @param {function(HitsRenderingOptions)} renderFn function that renders the hits widget
  * @return {function(CustomHitsWidgetOptions)} a widget factory for hits widget
  */
export default function connectHits(renderFn) {
  checkRendering(renderFn, usage);

  return ({hitsPerPage = 20}) => ({
    getConfiguration() {
      return {hitsPerPage};
    },

    init({instantSearchInstance}) {
      renderFn({
        hits: [],
        results: undefined,
        instantSearchInstance,
      }, true);
    },

    render({results, instantSearchInstance}) {
      renderFn({
        hits: results.hits,
        results,
        instantSearchInstance,
      }, false);
    },
  });
}
