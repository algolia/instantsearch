import connectHierarchicalMenu from '../connectors/connectHierarchicalMenu.js';
import HierarchicalMenuComponent from '../components/HierarchicalMenu.js';

/**
 * The hierarchical menu is a widget that lets the user explore a tree-like structure.
 * This is commonly used for multi-level categorization of products on e-commerce
 * websites. From a UX point of view, we suggest not displaying more than two levels deep.
 * @name HierarchicalMenu
 * @kind widget
 * @propType {string} attributes - List of attributes to use to generate the hierarchy of the menu. See the example for the convention to follow.
 * @propType {boolean} [showMore=false] - Flag to activate the show more button, for toggling the number of items between limitMin and limitMax.
 * @propType {number} [limitMin=10] -  The maximum number of items displayed.
 * @propType {number} [limitMax=20] -  The maximum number of items displayed when the user triggers the show more. Not considered if `showMore` is false.
 * @propType {string} [separator='>'] -  Specifies the level separator used in the data.
 * @propType {string[]} [rootPath=null] - The already selected and hidden path.
 * @propType {boolean} [showParentLevel=true] - Flag to set if the parent level should be displayed.
 * @propType {string} defaultRefinement - the item value selected by default
 * @propType {function} [transformItems] - If provided, this function can be used to modify the `items` provided prop of the wrapped component (ex: for filtering or sorting items). this function takes the `items` prop as a parameter and expects it back in return.
 * @themeKey ais-HierarchicalMenu__root - Container of the widget
 * @themeKey ais-HierarchicalMenu__items - Container of the items
 * @themeKey ais-HierarchicalMenu__item - Id for a single list item
 * @themeKey ais-HierarchicalMenu__itemSelected - Id for the selected items in the list
 * @themeKey ais-HierarchicalMenu__itemParent - Id for the elements that have a sub list displayed
 * @themeKey HierarchicalMenu__itemSelectedParent - Id for parents that have currently a child selected
 * @themeKey ais-HierarchicalMenu__itemLink - the link containing the label and the count
 * @themeKey ais-HierarchicalMenu__itemLabel - the label of the entry
 * @themeKey ais-HierarchicalMenu__itemCount - the count of the entry
 * @themeKey ais-HierarchicalMenu__itemItems - id representing a children
 * @themeKey ais-HierarchicalMenu__showMore - container for the show more button
 * @themeKey ais-HierarchicalMenu__noRefinement - present when there is no refinement
 * @translationKey showMore - Label value of the button which toggles the number of items
 * @example
 * import React from 'react';

 * import {
 *   InstantSearch,
 *   HierarchicalMenu,
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
