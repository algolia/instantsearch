import { checkRendering } from '../../lib/utils.js';

const usage = `Usage:
var customPoweredBy = connectPoweredBy(function render(params, isFirstRendering) {
  // params = {
  //   url,
  //   widgetParams,
  //   instantSearchInstance,
  // }
});
search.addWidget(customPoweredBy({
  [ theme = 'light' ]
}));
Full documentation available at https://community.algolia.com/instantsearch.js/v2/connectors/connectPoweredBy.html`;

/**
 * @typedef {Object} PoweredByWidgetOptions
 * @property {string} [theme] The theme of the logo ("light" or "dark").
 *
 * You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax).
 * @property {function(object[]):object[]} [transformItems] Function to transform the items passed to the templates.
 */

/**
 * @typedef {Object} PoweredByRenderingOptions
 * @property {string} url The URL to redirect to.
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
    const defaultUrl =
      'https://www.algolia.com/?' +
      'utm_source=instantsearch.js&' +
      'utm_medium=website&' +
      `utm_content=${location.hostname}&` +
      'utm_campaign=poweredby';

    return {
      init({ url = defaultUrl }) {
        renderFn(
          {
            widgetParams,
            url,
          },
          true
        );
      },

      render({ url = defaultUrl }) {
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
