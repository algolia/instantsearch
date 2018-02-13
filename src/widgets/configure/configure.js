import isPlainObject from 'lodash/isPlainObject';
const usage = `Usage:
search.addWidget(
  instantsearch.widgets.configure({
    searchParameters: {} // any searchParameter
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/widgets/configure.html
`;

/**
 * @typedef {Object} ConfigureWidgetOptions
 * @property {SearchParameters} searchParameters the parameters to apply when this widget is mounted
 */

/**
 * The **Configure** widget provides the logic to build a custom widget that
 * will give the user the ability to add arbitrary search parameters.
 *
 * This widget has no visible UI, so you should only use it for search parameters
 * users shouldn't expect to change.
 *
 * @type {WidgetFactory}
 * @category filter
 * @param {ConfigureWidgetOptions} $0 The Configure widget options
 * @returns {Object} A new Configure widget instance.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.configure({
 *     searchParameters: {
 *       analytics: true,
 *       ruleContexts: ['desktop', 'cool-users'],
 *       distinct: 3,
 *     }
 *   })
 * );
 */
export default function configure({ searchParameters = {} } = {}) {
  if (!isPlainObject(searchParameters)) {
    throw new Error(usage);
  }
  return {
    getConfiguration() {
      return searchParameters;
    },
    init() {},
    dispose({ state }) {
      return state.mutateMe(mutableState => {
        // widgetParams are assumed 'controlled',
        // so they override whatever other widgets give the state
        Object.keys(searchParameters).forEach(key => {
          delete mutableState[key];
        });
      });
    },
  };
}
