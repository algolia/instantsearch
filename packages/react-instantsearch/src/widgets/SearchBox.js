import connectSearchBox from '../connectors/connectSearchBox.js';
import SearchBoxComponent from '../components/SearchBox.js';

/**
 * The SearchBox component displays a search box that lets the user search for a specific query.
 * @name SearchBox
 * @kind widget
 * @propType {string[]} [focusShortcuts=['s','/']] - List of keyboard shortcuts that focus the search box. Accepts key names and key codes.
 * @propType {boolean} [autoFocus=false] - Should the search box be focused on render?
 * @propType {boolean} [searchAsYouType=true] - Should we search on every change to the query? If you disable this option, new searches will only be triggered by clicking the search button or by pressing the enter key while the search box is focused.
 * @propType {function} [onSubmit] - Intercept submit event sent from the SearchBox form container.
 * @propType {function} [onReset] - Listen to `reset` event sent from the SearchBox form container.
 * @propType {function} [on*] - Listen to any events sent form the search input itself.
 * @propType {React.Element} [submitComponent] - Change the apparence of the default submit button (magnifying glass).
 * @propType {React.Element} [resetComponent] - Change the apparence of the default reset button (cross).
 * @propType {React.Element} [loadingIndicatorComponent] - Change the apparence of the default loading indicator (spinning circle).
 * @propType {string} [defaultRefinement] - Provide default refinement value when component is mounted.
 * @propType {boolean} [showLoadingIndicator=false] - Display that the search is loading. This only happens after a certain amount of time to avoid a blinking effect. This timer can be configured with `stalledSearchDelay` props on <InstantSearch>. By default, the value is 200ms.
 * @themeKey ais-SearchBox__root - the root of the component
 * @themeKey ais-SearchBox__wrapper - the search box wrapper
 * @themeKey ais-SearchBox__input - the search box input
 * @themeKey ais-SearchBox__submit - the submit button
 * @themeKey ais-SearchBox__reset - the reset button
 * @themeKey ais-SearchBox__loading-indicator - the loading indicator
 * @translationkey submitTitle - The submit button title
 * @translationkey resetTitle - The reset button title
 * @translationkey placeholder - The label of the input placeholder
 * @example
 * import React from 'react';
 *
 * import { SearchBox, InstantSearch } from 'react-instantsearch/dom';
 *
 * export default function App() {
 *   return (
 *     <InstantSearch
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
