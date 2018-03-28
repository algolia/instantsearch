import isFunction from 'lodash/isFunction';
import isPlainObject from 'lodash/isPlainObject';

import { enhanceConfiguration } from '../../lib/utils.js';

const usage = `Usage:
var customConfigureWidget = connectConfigure(
  function renderFn(params, isFirstRendering) {
    // params = {
    //   refine,
    //   widgetParams
    // }
  },
  function disposeFn() {}
)
`;

/**
 * @typedef {Object} CustomConfigureWidgetOptions
 * @property {Object} searchParameters The Configure widget options are search parameters
 */

/**
 * @typedef {Object} ConfigureRenderingOptions
 * @property {function(searchParameters: Object)} refine Sets new `searchParameters` and trigger a search.
 * @property {Object} widgetParams All original `CustomConfigureWidgetOptions` forwarded to the `renderFn`.
 */

/**
 * The **Configure** connector provides the logic to build a custom widget
 * that will give you ability to override or force some search parameters sent to Algolia API.
 *
 * @type {Connector}
 * @param {function(ConfigureRenderingOptions)} renderFn Rendering function for the custom **Configure** Widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomConfigureWidgetOptions)} Re-usable widget factory for a custom **Configure** widget.
 */
export default function connectConfigure(renderFn, unmountFn) {
  if (
    (isFunction(renderFn) && !isFunction(unmountFn)) ||
    (!isFunction(renderFn) && isFunction(unmountFn))
  ) {
    throw new Error(usage);
  }

  return (widgetParams = {}) => {
    if (!isPlainObject(widgetParams.searchParameters)) {
      throw new Error(usage);
    }

    return {
      getConfiguration() {
        return widgetParams.searchParameters;
      },

      init({ helper }) {
        this._refine = this.refine(helper);

        if (isFunction(renderFn)) {
          renderFn(
            {
              refine: this._refine,
              widgetParams,
            },
            true
          );
        }
      },

      refine(helper) {
        return searchParameters => {
          // merge new `searchParameters` with the ones set from other widgets
          const actualState = this.removeSearchParameters(helper.getState());
          const nextSearchParameters = enhanceConfiguration({})(actualState, {
            getConfiguration: () => searchParameters,
          });

          // trigger a search with the new merged searchParameters
          helper.setState(nextSearchParameters).search();

          // update original `widgetParams.searchParameters` to the new refined one
          widgetParams.searchParameters = searchParameters;
        };
      },

      render() {
        if (renderFn) {
          renderFn(
            {
              refine: this._refine,
              widgetParams,
            },
            false
          );
        }
      },

      dispose({ state }) {
        if (unmountFn) unmountFn();
        return this.removeSearchParameters(state);
      },

      removeSearchParameters(state) {
        // widgetParams are assumed 'controlled',
        // so they override whatever other widgets give the state
        return state.mutateMe(mutableState => {
          Object.keys(widgetParams.searchParameters).forEach(key => {
            delete mutableState[key];
          });
        });
      },
    };
  };
}
