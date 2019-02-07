import connectConfigure from '../../connectors/configure/connectConfigure';

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
  // This is a renderless widget that falls back to the connector's
  // noop render and unmount functions.
  const makeWidget = connectConfigure();

  return makeWidget({ searchParameters });
}
