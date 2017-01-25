import connectRefinementList from '../connectors/connectRefinementList.js';
import RefinementListComponent from '../components/RefinementList.js';

/**
 * The RefinementList component displays a list that let the end user choose multiple values for a specific facet.
 * @name RefinementList
 * @kind widget
 * @propType {string} attributeName - the name of the attribute in the record
 * @propType {string} [operator=or] - How to apply the refinements. Possible values: 'or' or 'and'.
 * @propType {boolean} [showMore=false] - true if the component should display a button that will expand the number of items
 * @propType {number} [limitMin=10] - the minimum number of displayed items
 * @propType {number} [limitMax=20] - the maximum number of displayed items. Only used when showMore is set to `true`
 * @propType {string[]} defaultRefinement - the values of the items selected by default
 * @propType {boolean} [searchForFacetValues=false] - true if the component should display an input to search for facet values
 * @propType {function} [transformItems] - If provided, this function can be used to modify the `items` provided prop of the wrapped component (ex: for filtering or sorting items). this function takes the `items` prop as a parameter and expects it back in return.
 * @themeKey ais-RefinementList__root - the root of the component
 * @themeKey ais-RefinementList__items - the container of all items in the list
 * @themeKey ais-RefinementList__itemSelected - the selected list item
 * @themeKey ais-RefinementList__itemCheckbox - the item checkbox
 * @themeKey ais-RefinementList__itemCheckboxSelected - the selected item checkbox
 * @themeKey ais-RefinementList__itemLabel - the item label
 * @themeKey ais-RefinementList__itemLabelSelected - the selected item label
 * @themeKey RefinementList__itemCount - the item count
 * @themeKey RefinementList__itemCountSelected - the selected item count
 * @themeKey ais-RefinementList__showMore - the button that let the user toggle more results
 * @themeKey ais-RefinementList__noRefinement - present when there is no refinement
 * @themeKey ais-RefinementList__SearchBox - the container of the search for facet values searchbox. See [the SearchBox documentation](widgets/SearchBox.html#classnames) for the classnames and translation keys of the SearchBox.
 * @translationkey showMore - The label of the show more button. Accepts one parameters, a boolean that is true if the values are expanded
 * @translationkey noResults - The label of the no results text when no search for facet values results are found.
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
