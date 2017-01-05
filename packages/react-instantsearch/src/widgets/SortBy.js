import connectSortBy from '../connectors/connectSortBy.js';
import SortByComponent from '../components/SortBy.js';

/**
 * The SortBy component displays a list of indexes allowing a user to change the hits are sorting.
 * @name SortBy
 * @kind widget
 * @propType {string} defaultRefinement - The default selected index.
 * @propType {{value, label}[]} items - The list of indexes to search in.
 * @propType {function} [transformItems] - If provided, this function can be used to modify the `items` provided prop of the wrapped component (ex: for filtering or sorting items). this function takes the `items` prop as a parameter and expects it back in return.
 * @themeKey ais-SortBy__root - the root of the component
 * @example
 * import React from 'react';
 *
 * import {SortBy, InstantSearch} from '../packages/react-instantsearch/dom';
 *
 * export default function App() {
 *   return (
 *     <InstantSearch
 *       className="container-fluid"
 *       appId="latency"
 *       apiKey="6be0576ff61c053d5f9a3225e2a90f76"
 *       indexName="ikea"
 *     >
 *       <SortBy
 *          items={[
 *            {value: 'ikea', label: 'Featured'},
 *            {value: 'ikea_price_asc', label: 'Price asc.'},
 *            {value: 'ikea_price_desc', label: 'Price desc.'},
 *          ]}
 *          defaultRefinement="ikea"
 *        />
 *     </InstantSearch>
 *   );
 * } */
export default connectSortBy(SortByComponent);
