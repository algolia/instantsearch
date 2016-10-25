import connectHierarchicalMenu from '../connectors/connectHierarchicalMenu.js';
import HierarchicalMenuComponent from '../components/HierarchicalMenu.js';

/**
 * The hierarchical menu is a widget that lets the user explore a tree-like structure.
 * This is commonly used for multi-level categorization of products on e-commerce
 * websites. From a UX point of view, we suggest not displaying more than two levels deep.
 * @name HierarchicalMenu
 * @kind component
 * @category widget
 * @propType {boolean} [showMore=false] - Flag to activate the show more button, for toggling the number of items between limitMin and limitMax.
 * @propType {number} [limitMin=10] -  The maximum number of items displayed.
 * @propType {number} [limitMax=20] -  The maximum number of items displayed when the user triggers the show more. Not considered if `showMore` is false.
 * @propType {string[]} [sortBy=['name:asc']] - Specifies the way the values are sorted for diplay.
 * @propType {string} [separator='>'] -  Specifies the level separator used in the data.
 * @propType {string[]} [rootPath=null] - The already selected and hidden path.
 * @propType {boolean} [showParentLevel=true] - Flag to set if the parent level should be displayed.
 * @themeKey root - Container of the widget
 * @themeKey items - Container of the items
 * @themeKey item - Id for a single list item
 * @themeKey itemSelected - Id for the selected items in the list
 * @themeKey itemParent - Id for the elements that contains a sub list
 * @themeKey itemSelectedParent - Id for parents that are currently selected
 * @themeKey itemLink - the link containing the label and the count
 * @themeKey itemLabel - the label of the entry
 * @themeKey itemCount - the count of the entry
 * @themeKey itemChildren - id representing a children
 * @themeKey showMore - container for the show more button
 * @translationKey showMore - Label value of the button which togges the number of items
 * @translationKey count - Label for the display of count
 * @example
 * import React from 'react';

 * import {
 *   InstantSearch,
 *   SearchBox as OriginalSearchBox,
 *   RefinementList,
 *   Hits,
 *   Stats,
 *   Pagination,
 *   Range,
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
 *       <HierarchicalMenu
 *         id="categories"
 *         key="categories"
 *         attributes={[
 *           'category',
 *           'sub_category',
 *           'sub_sub_category',
 *         ]}
 *       />
 *     </InstantSearch>
 *   );
 * }
 */
export default connectHierarchicalMenu(HierarchicalMenuComponent);
