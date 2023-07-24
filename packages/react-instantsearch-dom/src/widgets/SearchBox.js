import { connectSearchBox } from 'react-instantsearch-core';

import SearchBox from '../components/SearchBox';

/**
 * The SearchBox component displays a search box that lets the user search for a specific query.
 * @name SearchBox
 * @kind widget
 * @propType {string[]} [focusShortcuts=['s','/']] - List of keyboard shortcuts that focus the search box. Accepts key names and key codes.
 * @propType {boolean} [autoFocus=false] - Should the search box be focused on render?
 * @propType {boolean} [searchAsYouType=true] - Should we search on every change to the query? If you disable this option, new searches will only be triggered by clicking the search button or by pressing the enter key while the search box is focused.
 * @propType {function} [onSubmit] - Intercept submit event sent from the SearchBox form container.
 * @propType {function} [onReset] - Listen to `reset` event sent from the SearchBox form container.
 * @propType {function} [on*] - Listen to any events sent from the search input itself.
 * @propType {node} [submit] - Change the apparence of the default submit button (magnifying glass).
 * @propType {node} [reset] - Change the apparence of the default reset button (cross).
 * @propType {node} [loadingIndicator] - Change the apparence of the default loading indicator (spinning circle).
 * @propType {string} [defaultRefinement] - Provide default refinement value when component is mounted.
 * @propType {string} [inputId] - The id of the search input
 * @propType {boolean} [showLoadingIndicator=false] - Display that the search is loading. This only happens after a certain amount of time to avoid a blinking effect. This timer can be configured with `stalledSearchDelay` props on <InstantSearch>. By default, the value is 200ms.
 * @themeKey ais-SearchBox - the root div of the widget
 * @themeKey ais-SearchBox-form - the wrapping form
 * @themeKey ais-SearchBox-input - the search input
 * @themeKey ais-SearchBox-submit - the submit button
 * @themeKey ais-SearchBox-submitIcon - the default magnifier icon used with the search input
 * @themeKey ais-SearchBox-reset - the reset button used to clear the content of the input
 * @themeKey ais-SearchBox-resetIcon - the default reset icon used inside the reset button
 * @themeKey ais-SearchBox-loadingIndicator - the loading indicator container
 * @themeKey ais-SearchBox-loadingIcon - the default loading icon
 * @translationkey submitTitle - The submit button title
 * @translationkey resetTitle - The reset button title
 * @translationkey placeholder - The label of the input placeholder
 * @example
 * import React from 'react';
 * import algoliasearch from 'algoliasearch/lite';
 * import { InstantSearch, SearchBox } from 'react-instantsearch-dom';
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
 *     <SearchBox />
 *   </InstantSearch>
 * );
 */

export default connectSearchBox(SearchBox, { $$widgetType: 'ais.searchBox' });
