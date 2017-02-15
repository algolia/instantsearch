import connectHitsPerPage from '../connectors/connectHitsPerPage.js';
import HitsPerPageSelectComponent from '../components/HitsPerPage.js';

/**
 * The HitsPerPage widget displays a dropdown menu to let the user change the number
 * of displayed hits.
 *
 * @name HitsPerPage
 * @kind widget
 * @propType {{value: number, label: string}[]} items - List of available options.
 * @propType {number} defaultRefinement - The number of items selected by default
 * @propType {function} [transformItems] - Function to modify the items being displayed, e.g. for filtering or sorting them. Takes an items as parameter and expects it back in return.
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
