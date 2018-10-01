import { checkRendering } from '../../lib/utils.js';

const usage = `Usage:
var customPoweredBy = connectPoweredBy(function render(params, isFirstRendering) {
  // params = {
  //   instantSearchInstance,
  //   widgetParams,
  // }
});
search.addWidget(customPoweredBy({
  [ theme = 'light' ]
}));
Full documentation available at https://community.algolia.com/instantsearch.js/v2/connectors/connectPoweredBy.html`;

/**
 * @typedef {Object} PoweredByRenderingOptions
 * @property {object} widgetParams All original `PoweredByWidgetOptions` forwarded to the `renderFn`.
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
    return {
      init() {
        renderFn(
          {
            widgetParams,
          },
          true
        );
      },

      render() {
        renderFn(
          {
            widgetParams,
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
