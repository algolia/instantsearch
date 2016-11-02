import connectHitsPerPage from '../connectors/connectHitsPerPage.js';
import HitsPerPageSelectComponent from '../components/HitsPerPage.js';

/**
 * The HitsPerPage widget displays a dropdown menu of possible number of items that can be displayed.
 * With it a user can choose to display more or less results from Algolia.
 *
 * List of hits per page options.
 * Passing a list of numbers `[n]` is a shorthand for `[{value: n, label: n}]`.
 * Beware: the `label` of `HitsPerPage` items must be either a string or a number.
 * @name HitsPerPage
 * @kind component
 * @category widget
 * @propType {string} [id="hPP"] - The id of the widget.
 * @propType {number} defaultRefinement - The number of items selected by default
 * @propType {{value, label}[]|number[]} items - List of hits per page options. Passing a list of numbers [n] is a shorthand for [{value: n, label: n}].
 * @themeKey ais-HitsPerPage__root - the root of the component.
 * @example
 * import React from 'react';

 * import {
 *   InstantSearch,
 *   HitsPerPage,
 * } from 'react-instantsearch/dom';
 *
 * export default function App() {
 *   return (
 *     <InstantSearch
 *       className="container-fluid"
 *       appId="latency"
 *       apiKey="6be0576ff61c053d5f9a3225e2a90f76"
 *       indexName="ikea"
 *     >
 *       <HitsPerPage defaultRefinement={20}/>
 *     </InstantSearch>
 *   );
 * }
 */
export default connectHitsPerPage(HitsPerPageSelectComponent);
