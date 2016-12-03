import connectMenu from '../connectors/connectMenu.js';
import MenuComponent from '../components/Menu.js';

/**
 * The Menu component displays a menu that let the end user choose a single value for a specific facet.
 * @name Menu
 * @kind widget
 * @propType {string} attributeName - the name of the attribute in the record
 * @propType {boolean} [showMore=false] - true if the component should display a button that will expand the number of items
 * @propType {number} [limitMin=10] - the minimum number of diplayed items
 * @propType {number} [limitMax=20] - the maximun number of displayed items. Only used when showMore is set to `true`
 * @propType {string} defaultRefinement - the value of the item selected by default
 * @themeKey ais-Menu__root - the root of the component
 * @themeKey ais-Menu__items - the container of all items in the menu
 * @themeKey ais-Menu__item - a single item
 * @themeKey ais-Menu__itemLinkSelected - the selected menu item
 * @themeKey ais-Menu__itemLink - the item link
 * @themeKey ais-Menu__itemLabelSelected - the selected item label
 * @themeKey ais-Menu__itemLabel - the item label
 * @themeKey Menu__itemCount - the item count
 * @themeKey Menu__itemCountSelected - the selected item count
 * @themeKey showMore - the button that let the user toggle more results
 * @translationkey showMore - The label of the show more button. Accepts one parameters, a boolean that is true if the values are expanded
 * @example
 * import React from 'react';
 *
 * import {Menu, InstantSearch} from '../packages/react-instantsearch/dom';
 *
 * export default function App() {
 *   return (
 *     <InstantSearch
 *       className="container-fluid"
 *       appId="latency"
 *       apiKey="6be0576ff61c053d5f9a3225e2a90f76"
 *       indexName="ikea"
 *     >
 *       <Menu
 *         attributeName="category"
 *       />
 *     </InstantSearch>
 *   );
 * }
 */
export default connectMenu(MenuComponent);
