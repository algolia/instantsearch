import connectSortBy from '../connectors/connectSortBy';
import SortBy from '../components/SortBy';

/**
 * The SortBy component displays a list of indexes allowing a user to change the hits are sorting.
 * @name SortBy
 * @requirements Algolia handles sorting by creating replica indices. [Read more about sorting](https://www.algolia.com/doc/guides/relevance/sorting/) on
 * the Algolia website.
 * @kind widget
 * @propType {{value: string, label: string}[]} items - The list of indexes to search in.
 * @propType {string} defaultRefinement - The default selected index.
 * @propType {function} [transformItems] - Function to modify the items being displayed, e.g. for filtering or sorting them. Takes an items as parameter and expects it back in return.
 * @themeKey ais-SortBy - the root div of the widget
 * @themeKey ais-SortBy-select - the select
 * @themeKey ais-SortBy-option - the select option
 * @example
 * import React from 'react';
 *
 * import { SortBy, InstantSearch } from 'react-instantsearch/dom';
 *
 * export default function App() {
 *   return (
 *     <InstantSearch
 *       appId="latency"
 *       apiKey="6be0576ff61c053d5f9a3225e2a90f76"
 *       indexName="ikea"
 *     >
 *       <SortBy
 *         items={[
 *           { value: 'ikea', label: 'Featured' },
 *           { value: 'ikea_price_asc', label: 'Price asc.' },
 *           { value: 'ikea_price_desc', label: 'Price desc.' },
 *         ]}
 *         defaultRefinement="ikea"
 *       />
 *     </InstantSearch>
 *   );
 * }
 */

export default connectSortBy(SortBy);
