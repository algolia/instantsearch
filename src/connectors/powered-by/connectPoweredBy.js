import { checkRendering } from '../../lib/utils.js';

const usage = `Usage:
var customPoweredBy = connectPoweredBy(function render(params, isFirstRendering) {
  // params = {
  //   widgetParams,
  //   instantSearchInstance,
  // }
});
search.addWidget(customPoweredBy({
  [ theme = 'light' ],
  [ url ]
}));
Full documentation available at https://community.algolia.com/instantsearch.js/v2/connectors/connectPoweredBy.html`;

/**
 * @typedef {Object} PoweredByWidgetOptions
 * @property {string} [theme] The theme of the logo ("light" or "dark").
 * @property {string} [url] The URL to redirect to.
 */

/**
 * @typedef {Object} PoweredByRenderingOptions
 * @property {Object} widgetParams All original `PoweredByWidgetOptions` forwarded to the `renderFn`.
 */

/**
 * **PoweredBy** connector provides the logic to build a custom widget that will displays
 * the logo to redirect to Algolia.
 *
 * @type {Connector}
 * @param {function(PoweredByRenderingOptions, boolean)} renderFn Rendering function for the custom **PoweredBy** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function} Re-usable widget factory for a custom **PoweredBy** widget.
 */
export default function connectPoweredBy(renderFn, unmountFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const url =
      widgetParams.url ||
      'https://www.algolia.com/?' +
        'utm_source=instantsearch.js&' +
        'utm_medium=website&' +
        `utm_content=${
          typeof window !== 'undefined' && window.location
            ? window.location.hostname
            : ''
        }&` +
        'utm_campaign=poweredby';

    return {
      init() {
        renderFn(
          {
            widgetParams,
            url,
          },
          true
        );
      },

      render() {
        renderFn(
          {
            widgetParams,
            url,
          },
          false
        );
      },

      dispose() {
        unmountFn();
      },
    };
  };
}
