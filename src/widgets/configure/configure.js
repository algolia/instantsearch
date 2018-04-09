import connectConfigure from '../../connectors/configure/connectConfigure.js';

const usage = `Usage:
search.addWidget(
  instantsearch.widgets.configure({
    // any searchParameter
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/v2/widgets/configure.html
`;

/**
 * The **configure** widget is a headless widget that let you configure the
 * settings of your search using the parameters described by the
 * [general Algolia documentation](https://www.algolia.com/doc/api-reference/search-api-parameters/)
 *
 * This widget has no visible UI, so you should only use it for search parameters
 * users shouldn't expect to change.
 *
 * @type {WidgetFactory}
 * @category filter
 * @param {SearchParameters} searchParameters The Configure widget options are search parameters
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
export default function configure(searchParameters) {
  try {
    // We do not have default renderFn && unmountFn for this widget
    const makeWidget = connectConfigure();
    return makeWidget({ searchParameters });
  } catch (e) {
    throw new Error(usage);
  }
}
