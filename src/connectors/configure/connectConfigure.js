import { checkRendering } from '../../lib/utils.js';

const usage = `Usage:
var configure = connectConfigure(function render(params, isFirstRendering) {
  // params is whatever you put as argument to the widget
  // usually you'll just have a function which does nothing
  // as rendering for connectConfigure
});
search.addWidget(
  configure({
    // any helper parameters
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectConfigure.html
`;

/**
 * @typedef {Object} CustomConfigureWidgetOptions any search parameters, passed
 * to the helper as-is.
 */

/**
 * @typedef {undefined} ConfigureRenderingOptions configure is not supposed to
 * render anything, and thus doesn't have any parameters for the rendering.
 * 
 * If you want to make a custom widget which does render something, please read:
 * https://community.algolia.com/instantsearch.js/v2/guides/custom-widget.html
 */

/**
 * **Configure** connector provides the logic to build a custom widget that will
 * give the user the ability to add arbitrary search parameters
 *
 * This connector provides no `refine` function.
 *
 * @type {Connector}
 * @param {function(ConfigureRenderingOptions)} renderFn Rendering function for the custom **Configure** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomConfigureWidgetOptions)} Re-usable widget factory for a custom **Configure** widget.
 * @example
 * // custom `renderFn` to render the custom Configure widget
 * //
 * // The parameters to `renderFn` are whatever you put as
 * // argument to the widget. Usually you'll just have a function
 * // which does nothing as rendering for connectConfigure
 * var configure = connectConfigure(function render(function() {}, isFirstRendering) {});
 * search.addWidget(
 *   configure({
 *     // any helper parameters
 *   })
 * );
 */
export default function connectConfigure(renderFn, unmountFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => ({
    getConfiguration() {
      return widgetParams;
    },
    init() {},
    dispose({ state }) {
      unmountFn();

      return state.mutateMe(mutableState => {
        // widgetParams are assumed 'controlled',
        // so they override whatever other widgets give the state
        Object.keys(widgetParams).forEach(key => {
          delete mutableState[key];
        });
      });
    },
  });
}
