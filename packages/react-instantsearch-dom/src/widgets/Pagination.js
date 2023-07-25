import React from 'react';
import { connectPagination } from 'react-instantsearch-core';

import Pagination from '../components/Pagination';
import PanelCallbackHandler from '../components/PanelCallbackHandler';

/**
 * The Pagination widget displays a simple pagination system allowing the user to
 * change the current page.
 * @name Pagination
 * @kind widget
 * @propType {boolean} [showFirst=true] - Display the first page link.
 * @propType {boolean} [showLast=false] - Display the last page link.
 * @propType {boolean} [showPrevious=true] - Display the previous page link.
 * @propType {boolean} [showNext=true] - Display the next page link.
 * @propType {number} [padding=3] - How many page links to display around the current page.
 * @propType {number} [totalPages=Infinity] - Maximum number of pages to display.
 * @themeKey ais-Pagination - the root div of the widget
 * @themeKey ais-Pagination--noRefinement - the root div of the widget when there is no refinement
 * @themeKey ais-Pagination-list - the list of all pagination items
 * @themeKey ais-Pagination-list--noRefinement - the list of all pagination items when there is no refinement
 * @themeKey ais-Pagination-item - the pagination list item
 * @themeKey ais-Pagination-item--firstPage - the "first" pagination list item
 * @themeKey ais-Pagination-item--lastPage - the "last" pagination list item
 * @themeKey ais-Pagination-item--previousPage - the "previous" pagination list item
 * @themeKey ais-Pagination-item--nextPage - the "next" pagination list item
 * @themeKey ais-Pagination-item--page - the "page" pagination list item
 * @themeKey ais-Pagination-item--selected - the selected pagination list item
 * @themeKey ais-Pagination-item--disabled - the disabled pagination list item
 * @themeKey ais-Pagination-link - the pagination clickable element
 * @translationKey previous - Label value for the previous page link
 * @translationKey next - Label value for the next page link
 * @translationKey first - Label value for the first page link
 * @translationKey last - Label value for the last page link
 * @translationkey page - Label value for a page item. You get function(currentRefinement) and you need to return a string
 * @translationKey ariaPrevious - Accessibility label value for the previous page link
 * @translationKey ariaNext - Accessibility label value for the next page link
 * @translationKey ariaFirst - Accessibility label value for the first page link
 * @translationKey ariaLast - Accessibility label value for the last page link
 * @translationkey ariaPage - Accessibility label value for a page item. You get function(currentRefinement) and you need to return a string
 * @example
 * import React from 'react';
 * import algoliasearch from 'algoliasearch/lite';
 * import { InstantSearch, Pagination } from 'react-instantsearch-dom';
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
 *     <Pagination />
 *   </InstantSearch>
 * );
 */

const PaginationWidget = (props) => (
  <PanelCallbackHandler {...props}>
    <Pagination {...props} />
  </PanelCallbackHandler>
);

export default connectPagination(PaginationWidget, {
  $$widgetType: 'ais.pagination',
});
