import connectHitsPerPage from '../connectors/connectHitsPerPage.js';
import HitsPerPageSelectComponent from '../components/HitsPerPage.js';

/**
 * The HitsPerPage widget displays a dropdown menu of the chosen number of items to be displayed.
 * With it a user can choose to display more or fewer results from Algolia.
 *
 * List of hits per page options.
 * Passing a list of numbers `[n]` is a shorthand for `[{value: n, label: n}]`.
 * Beware: the `label` of `HitsPerPage` items must be either a string or a number.
 * @name HitsPerPage
 * @kind widget
 * @propType {number} defaultRefinement - The number of items selected by default
 * @propType {{value, label}[]|number[]} items - List of hits per page options. Passing a list of numbers [n] is a shorthand for [{value: n, label: n}].
 * @propType {function} [transformItems] - If provided, this function can be used to modify the `items` provided prop of the wrapped component (ex: for filtering or sorting items). this function takes the `items` prop as a parameter and expects it back in return.
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
