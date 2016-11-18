import connectSearchBox from '../connectors/connectSearchBox.js';
import SearchBoxComponent from '../components/SearchBox.js';

/**
 * The SearchBox component displays a search box that lets the user search for a specific query.
 * @name SearchBox
 * @kind component
 * @category widget
 * @propType {string[]} [focusShortcuts=['s','/']] - List of keyboard shortcuts that focus the search box. Accepts key names and key codes.
 * @propType {boolean} [autoFocus=false] - Should the search box be focused on render?
 * @propType {boolean} [searchAsYouType=true] - Should we search on every change to the query? If you disable this option, new searches will only be triggered by clicking the search button or by pressing the enter key while the search box is focused.
 * @themeKey ais-SearchBox__root - the root of the component
 * @themeKey ais-SearchBox__wrapper - the search box wrapper
 * @themeKey ais-SearchBox__input - the search box input
 * @themeKey ais-SearchBox__submit - the submit button
 * @themeKey ais-SearchBox__reset - the reset button
 * @translationkey submit - The submit button label
 * @translationkey reset - The reset button label
 * @translationkey submitTitle - The submit button title
 * @translationkey resetTitle - The reset button title
 * @translationkey placeholder - The label of the input placeholder
 * @example
 * import React from 'react';
 *
 * import {SearchBox, InstantSearch} from '../packages/react-instantsearch/dom';
 *
 * export default function App() {
 *   return (
 *     <InstantSearch
 *       className="container-fluid"
 *       appId="latency"
 *       apiKey="6be0576ff61c053d5f9a3225e2a90f76"
 *       indexName="ikea"
 *     >
 *       <SearchBox />
 *     </InstantSearch>
 *   );
 * }
 */
export default connectSearchBox(SearchBoxComponent);
