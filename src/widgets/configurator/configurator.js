
/**
 * This widget lets you configure your search with defaults parameters and
 * hardcoded ones. The configuration is usually propagated from the other
 * widgets, therefore you normally don't need this widget. Use case: default
 * parameters, search configuration.
 * For more information on how to use the internal helper library, check out
 * the [helper documentation for the state](https://community.algolia.com/algoliasearch-helper-js/docs/SearchParameters.html)
 * @function configurator
 * @param {function} [fn] function that will set the search. (helper) => ()
 * @return {object} the configurator widget
 */
export default function configurator(fn) {
  return {
    init: ({helper}) => {
      helper.setState(fn(helper.state));
    }
  };
}
