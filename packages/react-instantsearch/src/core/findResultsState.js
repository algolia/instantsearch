/**
 * Useful only for getting parsed by js-doc.
 * If put inside createInstantSearchServer.js (where findResultsState can be found),
 * jsdoc-parse is not able to parse it.
 */

/**
 * The `findResultsState` function provides a way to retrieve a `resultsState` to be passed to an [`<InstantSearch>`](widgets/InstantSearch.html)
 * component.
 * @name findResultsState
 * @kind server-side-rendering
 * @param {Component} App - You `<App>` component.
 * @param {object} props - Props to forward to the dedicated `<InstantSearch>` component. Use it to pass a `searchState` such as `{searchState: {query: 'chair'}}` when
 * dealing with [URL routing](guide/Routing.html)
 * @returns {Promise} - Resolved with a `resultsState` object.
 */
export function findResultsState() {}

/* eslint valid-jsdoc: 0 */
/**
 * The `createInstantSearch` let's you create a dedicated, server-side compatible, `<InstantSearch>` component along with a `findResultsState` function tied to this component.
 * @name createInstantSearch
 * @kind server-side-rendering
 * @returns {{InstantSearch: Component, findResultsState: function}} - returns {InstantSearch: Component, findResultsState: function}
*/
export function createInstantSearch() {}
