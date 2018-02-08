import isPlainObject from 'lodash/isPlainObject';
const usage = `Usage:
search.addWidget(
  instantsearch.widgets.configure({
    // any helper parameters
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/widgets/configure.html
`;

/**
 * The **Configure** widget provides the logic to build a custom widget that
 * will give the user the ability to add arbitrary search parameters.
 *
 * This widget has no visible UI, so you should only use it for search parameters
 * users shouldn't expect to change.
 *
 * @type {WidgetFactory}
 * @category filter
 * @param {Object} widgetParams Any search parameters accepted by the helper.
 * @returns {Object} A new Configure widget instance.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.configure({
 *     analytics: true,
 *     ruleContexts: ['desktop', 'cool-users'],
 *     distinct: 3,
 *   })
 * );
 */
export default function configure(widgetParams = {}) {
  if (!isPlainObject(widgetParams)) {
    throw new Error(usage);
  }
  return {
    getConfiguration() {
      return widgetParams;
    },
    init() {},
    dispose({ state }) {
      return state.mutateMe(mutableState => {
        // widgetParams are assumed 'controlled',
        // so they override whatever other widgets give the state
        Object.keys(widgetParams).forEach(key => {
          delete mutableState[key];
        });
      });
    },
  };
}
