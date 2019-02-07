import noop from 'lodash/noop';
import isPlainObject from 'lodash/isPlainObject';
import { createDocumentationMessageGenerator } from '../../lib/utils';
import { enhanceConfiguration } from '../../lib/InstantSearch';

const withUsage = createDocumentationMessageGenerator('configure', {
  connector: true,
});

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
export default function connectConfigure(renderFn = noop, unmountFn = noop) {
  return (widgetParams = {}) => {
    if (!isPlainObject(widgetParams.searchParameters)) {
      throw new Error(
        withUsage('The `searchParameters` option expects an object.')
      );
    }

    return {
      getConfiguration() {
        return widgetParams.searchParameters;
      },

      init({ helper }) {
        this._refine = this.refine(helper);

        renderFn(
          {
            refine: this._refine,
            widgetParams,
          },
          true
        );
      },

      refine(helper) {
        return searchParameters => {
          // merge new `searchParameters` with the ones set from other widgets
          const actualState = this.removeSearchParameters(helper.getState());
          const nextSearchParameters = enhanceConfiguration({})(
            { ...actualState },
            {
              getConfiguration: () => searchParameters,
            }
          );

          // trigger a search with the new merged searchParameters
          helper.setState(nextSearchParameters).search();

          // update original `widgetParams.searchParameters` to the new refined one
          widgetParams.searchParameters = searchParameters;
        };
      },

      render() {
        renderFn(
          {
            refine: this._refine,
            widgetParams,
          },
          false
        );
      },

      dispose({ state }) {
        unmountFn();

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
