import connectMenu from '../connectors/connectMenu.js';
import MenuComponent from '../components/Menu.js';

/**
 * The Menu component displays a menu that let the end user choose a single value for a specific facet.
 * @name Menu
 * @kind component
 * @category widget
 * @propType {string} id - the id of the widget
 * @propType {string} attributeName - the name of the attribute in the record
 * @propType {boolean} showMore - true if the component should display a button that will expand the number of items
 * @propType {number} limitMin - the minimum number of diplayed items
 * @propType {number} limitMax - the maximun number of displayed items. Only used when showMore is set to `true`
 * @propType {string[]} sortBy - defines how the items are sorted. See [the helper documentation](https://community.algolia.com/algoliasearch-helper-js/reference.html#specifying-a-different-sort-order-for-values) for the full list of options
 * @propType {string} defaultSelectedItem - the value of the item selected by default
 * @themeKey root - the root of the component
 * @themeKey items - the container of all items in the menu
 * @themeKey item - a single item
 * @themeKey itemSelected - the selected menu item
 * @themeKey itemLink - the item link
 * @themeKey itemLabel - the item label
 * @themeKey itemCount - the item count
 * @themeKey showMore - the button that let the user toggle more results
 * @translationkey count - The count formatting. Accepts one parameter, the number.
 * @translationkey showMore - The label of the show more button. Accepts one parameters, a boolean that is true if the values are expanded
 */
export default connectMenu(MenuComponent);
