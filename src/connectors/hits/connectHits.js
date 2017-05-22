import escape from 'lodash/escape';
import isPlainObject from 'lodash/isPlainObject';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import reduce from 'lodash/reduce';

import {checkRendering} from '../../lib/utils.js';

const usage = `Usage:
var customHits = connectHits(function render(params, isFirstRendering) {
  // params = {
  //   hits,
  //   results,
  //   instantSearchInstance,
  //   widgetParams,
  // }
});
search.addWidget(customHits());
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectHits.html
`;

const config = {
  highlightPreTag: '__ais-highlight__',
  highlightPostTag: '__/ais-highlight__',
};

/**
 * @typedef {Object} HitsRenderingOptions
 * @property {Object[]} hits The matched hits from Algolia API.
 * @property {Object} results The complete results response from Algolia API.
 * @property {Object} widgetParams All original widget options forwarded to the `renderFn`.
 */

/**
 * **Hits** connector provides the logic to create custom widgets that will render the results retrieved from Algolia.
 * @type {Connector}
 * @param {function(HitsRenderingOptions, boolean)} renderFn Rendering function for the custom **Hits** widget.
 * @return {function} Re-usable widget factory for a custom **Hits** widget.
 * @example
 * // custom `renderFn` to render the custom Hits widget
 * function renderFn(HitsRenderingOptions) {
 *   HitsRenderingOptions.widgetParams.containerNode.html(
 *     HitsRenderingOptions.hits.map(function(hit) {
 *       return '<div>' + hit._highlightResult.name.value + '</div>';
 *     })
 *   );
 * }
 *
 * // connect `renderFn` to Hits logic
 * var customHits = instantsearch.connectors.connectHits(renderFn);
 *
 * // mount widget on the page
 * search.addWidget(
 *   customHits({
 *     containerNode: $('#custom-hits-container'),
 *   })
 * );
 */
export default function connectHits(renderFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => ({
    getConfiguration() {
      return config;
    },

    init({instantSearchInstance}) {
      renderFn({
        hits: [],
        results: undefined,
        instantSearchInstance,
        widgetParams,
      }, true);
    },

    render({results, instantSearchInstance}) {
      results.hits = recursiveEscape(results.hits);

      renderFn({
        hits: results.hits,
        results,
        instantSearchInstance,
        widgetParams,
      }, false);
    },
  });
}

function replaceWithEm(val) {
  if (isPlainObject(val)) {
    return reduce(
      val,
      (result, value, key) => {
        result[key] = replaceWithEm(value);
        return {};
      },
      {}
    );
  }

  if (isArray(val)) {
    return val.map(replaceWithEm);
  }

  if (isString(val)) {
    return val
      .replace(new RegExp(config.highlightPreTag, 'g'), '<em>')
      .replace(new RegExp(config.highlightPostTag, 'g'), '</em>');
  }

  return val;
}

function escapeHighlightProperty(highlightResult) {
  return reduce(
    highlightResult,
    (result, value, key) => {
      if (isPlainObject(value)) {
        value.value = replaceWithEm(recursiveEscape(value.value));
        result[key] = value;
      }

      if (isArray(value)) {
        result[key] = value.map(item => {
          item.value = replaceWithEm(recursiveEscape(item.value));
          return item;
        });
      }

      return result;
    },
    {}
  );
}

function recursiveEscape(val) {
  if (isPlainObject(val)) {
    return reduce(
      val,
      (result, value, key) => {
        result[key] = key === '_highlightResult' || key === '_snippetResult'
          ? escapeHighlightProperty(value)
          : recursiveEscape(value);
        return result;
      },
      {}
    );
  }

  if (isString(val)) {
    return escape(val);
  }

  if (isArray(val)) {
    return val.map(recursiveEscape);
  }

  return val;
}
