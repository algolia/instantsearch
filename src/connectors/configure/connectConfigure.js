import isFunction from 'lodash/isFunction';

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
 * **Configure** connector provides the logic to build a custom widget
 * that will give you ability to override or force some search parameters sent to Algolia API.
 *
 * @type {Connector}
 * @param {function(ConfigureRenderingOptions)} renderFn Rendering function for the custom **Configure** Widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomConfigureWidgetOptions)} Re-usable widget factory for a custom **Configure** widget.
 */
export default function connectConfigure(renderFn, unmountFn) {
  return (widgetParams = {}) => {
    if (
      !widgetParams.searchParameters ||
      (isFunction(renderFn) && !isFunction(unmountFn)) ||
      (!isFunction(renderFn) && isFunction(unmountFn))
    ) {
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
          const actualState = helper.getState();
          const nextSearchParameters = enhanceConfiguration({})(actualState, {
            getConfiguration: () => searchParameters,
          });

          // trigger a search with the new merged searchParameter
          helper.setState(nextSearchParameters).search();

          // update original `widgetParams.searchParameter` to the new refined one
          widgetParams.searchParameters = nextSearchParameters;
        };
      },

      render() {
        if (isFunction(renderFn)) {
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
        if (isFunction(unmountFn)) unmountFn();

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
