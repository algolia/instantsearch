import connectHierarchicalMenu from '../connectors/connectHierarchicalMenu.js';
import HierarchicalMenuComponent from '../components/HierarchicalMenu.js';

/**
 * The hierarchical menu lets the user browse attributes using a tree-like structure.
 *
 * This is commonly used for multi-level categorization of products on e-commerce
 * websites. From a UX point of view, we suggest not displaying more than two levels deep.
 *
 * @name HierarchicalMenu
 * @kind widget
 * @requirements To use this widget, your attributes must be formatted in a specific way.
 * If you want for example to have a hiearchical menu of categories, objects in your index
 * should be formatted this way:
 *
 * ```json
 * {
 *   "categories.lvl0": "products",
 *   "categories.lvl1": "products > fruits",
 *   "categories.lvl2": "products > fruits > citrus"
 * }
 * ```
 *
 * It's also possible to provide more than one path for each level:
 *
 * ```json
 * {
 *   "categories.lvl0": ["products", "goods"],
 *   "categories.lvl1": ["products > fruits", "goods > to eat"]
 * }
 * ```
 *
 * All attributes passed to the `attributes` prop must be present in "attributes for faceting"
 * on the Algolia dashboard or configured as `attributesForFaceting` via a set settings call to the Algolia API.
 *
 * @propType {string} attributes - List of attributes to use to generate the hierarchy of the menu. See the example for the convention to follow.
 * @propType {boolean} [showMore=false] - Flag to activate the show more button, for toggling the number of items between limitMin and limitMax.
 * @propType {number} [limitMin=10] -  The maximum number of items displayed.
 * @propType {number} [limitMax=20] -  The maximum number of items displayed when the user triggers the show more. Not considered if `showMore` is false.
 * @propType {string} [separator='>'] -  Specifies the level separator used in the data.
 * @propType {string[]} [rootPath=null] - The already selected and hidden path.
 * @propType {boolean} [showParentLevel=true] - Flag to set if the parent level should be displayed.
 * @propType {string} [defaultRefinement] - the item value selected by default
 * @propType {function} [transformItems] - Function to modify the items being displayed, e.g. for filtering or sorting them. Takes an items as parameter and expects it back in return.
 * @themeKey ais-HierarchicalMenu__root - Container of the widget
 * @themeKey ais-HierarchicalMenu__items - Container of the items
 * @themeKey ais-HierarchicalMenu__item - Id for a single list item
 * @themeKey ais-HierarchicalMenu__itemSelected - Id for the selected items in the list
 * @themeKey ais-HierarchicalMenu__itemParent - Id for the elements that have a sub list displayed
 * @themeKey ais-HierarchicalMenu__itemSelectedParent - Id for parents that have currently a child selected
 * @themeKey ais-HierarchicalMenu__itemLink - the link containing the label and the count
 * @themeKey ais-HierarchicalMenu__itemLabel - the label of the entry
 * @themeKey ais-HierarchicalMenu__itemCount - the count of the entry
 * @themeKey ais-HierarchicalMenu__itemItems - id representing a children
 * @themeKey ais-HierarchicalMenu__showMore - container for the show more button
 * @themeKey ais-HierarchicalMenu__noRefinement - present when there is no refinement
 * @translationKey showMore - The label of the show more button. Accepts one parameter, a boolean that is true if the values are expanded
 * @example
 * import React from 'react';

 * import { HierarchicalMenu, InstantSearch } from 'react-instantsearch/dom';
 *
 * export default function App() {
 *   return (
 *     <InstantSearch
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
