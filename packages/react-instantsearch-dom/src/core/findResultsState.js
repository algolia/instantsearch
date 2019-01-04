/**
 * Useful only for getting parsed by js-doc.
 * If put inside createInstantSearchServer.js (where findResultsState can be found),
 * jsdoc-parse is not able to parse it.
 */

/**
 * The `findResultsState` function provides a way to retrieve a `resultsState` to be passed to an [`<InstantSearch>`](widgets/<InstantSearch>.html)
 * component.
 * @name findResultsState
 * @kind server-side-rendering
 * @param {Component} App - Your top level `<App>` component.
 * @param {object} props - Props passed to `<App>` for computing `resultsState`. Use it to pass a your initial `searchState` such as `{searchState: {query: 'chair'}}`. You'll typically do this when
 * dealing with [URL routing](guide/Routing.html) and pulling the initial search query from the URL. Make sure `<App>` passes the initial search state prop on to the `<InstantSearch>` component.
 * @returns {Promise} - Resolved with a `resultsState` object.
 */
export function findResultsState() {}

/**
 * The `createInstantSearch` let's you create a server-side compatible `<InstantSearch>` component along with a `findResultsState` function tied to this component. You'll use this component on both the server and client.
 * @name createInstantSearch
 * @kind server-side-rendering
 * @returns {{InstantSearch: Component, findResultsState: function}} - returns {InstantSearch: Component, findResultsState: function}
 */
export function createInstantSearch() {}
