import connectRefinementList from '../connectors/connectRefinementList.js';
import RefinementListComponent from '../components/RefinementList.js';

/**
 * The RefinementList component displays a list that let the end user choose multiple values for a specific facet.
 * @name RefinementList
 * @kind component
 * @category widget
 * @propType {string} id - the id of the widget
 * @propType {string} attributeName - the name of the attribute in the record
 * @propType {string} [operator=or] - How to apply the refinements. Possible values: 'or' or 'and'.
 * @propType {boolean} [showMore=false] - true if the component should display a button that will expand the number of items
 * @propType {number} [limitMin=10] - the minimum number of diplayed items
 * @propType {number} [limitMax=20] - the maximun number of displayed items. Only used when showMore is set to `true`
 * @propType {string[]} [sortBy=['count:desc','name:asc']] - defines how the items are sorted. See [the helper documentation](https://community.algolia.com/algoliasearch-helper-js/reference.html#specifying-a-different-sort-order-for-values) for the full list of options
 * @propType {string[]} defaultRefinement - the values of the items selected by default
 * @themeKey ais-RefinementList__root - the root of the component
 * @themeKey ais-RefinementList__items - the container of all items in the list
 * @themeKey ais-RefinementList__item - a single item
 * @themeKey ais-RefinementList__itemSelected - the selected list item
 * @themeKey ais-RefinementList__itemCheckbox - the item checkbox
 * @themeKey ais-RefinementList__itemCheckboxSelected - the selected item checkbox
 * @themeKey ais-RefinementList__itemLabel - the item label
 * @themeKey ais-RefinementList__itemLabelSelected - the selected item label
 * @themeKey RefinementList__itemCount - the item count
 * @themeKey RefinementList__itemCountSelected - the selected item count
 * @themeKey ais-RefinementList__showMore - the button that let the user toggle more results
 * @translationkey showMore - The label of the show more button. Accepts one parameters, a boolean that is true if the values are expanded
 * @example
 * import React from 'react';
 *
 * import {RefinementList, InstantSearch} from '../packages/react-instantsearch/dom';
 *
 * export default function App() {
 *   return (
 *     <InstantSearch
 *       className="container-fluid"
 *       appId="latency"
 *       apiKey="6be0576ff61c053d5f9a3225e2a90f76"
 *       indexName="ikea"
 *     >
 *       <RefinementList attributeName="colors" />
 *     </InstantSearch>
 *   );
 * }
 */
export default connectRefinementList(RefinementListComponent);
