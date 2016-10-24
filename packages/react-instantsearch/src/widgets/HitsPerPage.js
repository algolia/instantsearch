import connectHitsPerPage from '../connectors/connectHitsPerPage.js';
import HitsPerPageComponent from '../components/HitsPerPage.js';

/**
 * The HitsPerPage widget displays a list of possible number of items that can be displayed.
 * With it a user can choose to display more or less results from Algolia.
 * @name HitsPerPage
 * @kind component
 * @category widget
 * @propType {string} id - The id of the widget.
 * @propType {number} defaultHitsPerPage - The number of items  selected by default
 * @propType {{value, label}[]|number[]} items - List of hits per page options. Passing a list of numbers `[n]` is a shorthand for `[{value: n, label: n}]`.
 * @themeKey root - the root of the component.
 * @themeKey item - the container of a single item.
 * @themeKey itemLink - the link part of the selectable item.
 * @themeKey itemSelected - the selected item.
 * @example
 * import React from 'react';

 * import {
 *   InstantSearch,
 *   Hits,
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
 *       <HitsPerPage defaultHitsPerPage={20}/>
 *     </InstantSearch>
 *   );
 * }
 */
export default connectHitsPerPage(HitsPerPageComponent);
