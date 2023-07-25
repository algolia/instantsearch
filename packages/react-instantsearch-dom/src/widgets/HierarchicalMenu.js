import React from 'react';
import { connectHierarchicalMenu } from 'react-instantsearch-core';

import HierarchicalMenu from '../components/HierarchicalMenu';
import PanelCallbackHandler from '../components/PanelCallbackHandler';

/**
 * The hierarchical menu lets the user browse attributes using a tree-like structure.
 *
 * This is commonly used for multi-level categorization of products on e-commerce
 * websites. From a UX point of view, we suggest not displaying more than two levels deep.
 *
 * @name HierarchicalMenu
 * @kind widget
 * @requirements To use this widget, your attributes must be formatted in a specific way.
 * If you want for example to have a hierarchical menu of categories, objects in your index
 * should be formatted this way:
 *
 * ```json
 * [{
 *   "objectID": "321432",
 *   "name": "lemon",
 *   "categories.lvl0": "products",
 *   "categories.lvl1": "products > fruits",
 * },
 * {
 *   "objectID": "8976987",
 *   "name": "orange",
 *   "categories.lvl0": "products",
 *   "categories.lvl1": "products > fruits",
 * }]
 * ```
 *
 * It's also possible to provide more than one path for each level:
 *
 * ```json
 * {
 *   "objectID": "321432",
 *   "name": "lemon",
 *   "categories.lvl0": ["products", "goods"],
 *   "categories.lvl1": ["products > fruits", "goods > to eat"]
 * }
 * ```
 *
 * All attributes passed to the `attributes` prop must be present in "attributes for faceting"
 * on the Algolia dashboard or configured as `attributesForFaceting` via a set settings call to the Algolia API.
 *
 * @propType {array.<string>} attributes - List of attributes to use to generate the hierarchy of the menu. See the example for the convention to follow.
 * @propType {boolean} [showMore=false] - Flag to activate the show more button, for toggling the number of items between limit and showMoreLimit.
 * @propType {number} [limit=10] -  The maximum number of items displayed.
 * @propType {number} [showMoreLimit=20] -  The maximum number of items displayed when the user triggers the show more. Not considered if `showMore` is false.
 * @propType {string} [separator='>'] -  Specifies the level separator used in the data.
 * @propType {string} [rootPath=null] - The path to use if the first level is not the root level.
 * @propType {boolean} [showParentLevel=true] - Flag to set if the parent level should be displayed.
 * @propType {string} [defaultRefinement] - the item value selected by default
 * @propType {function} [transformItems] - Function to modify the items being displayed, e.g. for filtering or sorting them. Takes an items as parameter and expects it back in return.
 * @themeKey ais-HierarchicalMenu - the root div of the widget
 * @themeKey ais-HierarchicalMenu-noRefinement - the root div of the widget when there is no refinement
 * @themeKey ais-HierarchicalMenu-searchBox - the search box of the widget. See [the SearchBox documentation](widgets/SearchBox.html#classnames) for the classnames and translation keys of the SearchBox.
 * @themeKey ais-HierarchicalMenu-list - the list of menu items
 * @themeKey ais-HierarchicalMenu-list--child - the child list of menu items
 * @themeKey ais-HierarchicalMenu-item - the menu list item
 * @themeKey ais-HierarchicalMenu-item--selected - the selected menu list item
 * @themeKey ais-HierarchicalMenu-item--parent - the menu list item containing children
 * @themeKey ais-HierarchicalMenu-link - the clickable menu element
 * @themeKey ais-HierarchicalMenu-link--selected - the clickable element of a selected menu list item
 * @themeKey ais-HierarchicalMenu-label - the label of each item
 * @themeKey ais-HierarchicalMenu-count - the count of values for each item
 * @themeKey ais-HierarchicalMenu-showMore - the button used to display more categories
 * @themeKey ais-HierarchicalMenu-showMore--disabled - the disabled button used to display more categories
 * @translationKey showMore - The label of the show more button. Accepts one parameter, a boolean that is true if the values are expanded
 * @example
 * import React from 'react';
 * import algoliasearch from 'algoliasearch/lite';
 * import { InstantSearch, HierarchicalMenu } from 'react-instantsearch-dom';
 *
 * const searchClient = algoliasearch(
 *   'latency',
 *   '6be0576ff61c053d5f9a3225e2a90f76'
 * );
 *
 * const App = () => (
 *   <InstantSearch
 *     searchClient={searchClient}
 *     indexName="instant_search"
 *   >
 *     <HierarchicalMenu
 *       attributes={[
 *         'hierarchicalCategories.lvl0',
 *         'hierarchicalCategories.lvl1',
 *         'hierarchicalCategories.lvl2',
 *       ]}
 *     />
 *   </InstantSearch>
 * );
 */

const HierarchicalMenuWidget = (props) => (
  <PanelCallbackHandler {...props}>
    <HierarchicalMenu {...props} />
  </PanelCallbackHandler>
);

export default connectHierarchicalMenu(HierarchicalMenuWidget, {
  $$widgetType: 'ais.hierarchicalMenu',
});
