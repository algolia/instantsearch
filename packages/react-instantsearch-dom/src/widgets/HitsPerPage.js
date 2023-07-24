import { connectHitsPerPage } from 'react-instantsearch-core';

import HitsPerPage from '../components/HitsPerPage';

/**
 * The HitsPerPage widget displays a dropdown menu to let the user change the number
 * of displayed hits.
 *
 * If you only want to configure the number of hits per page without
 * displaying a widget, you should use the `<Configure hitsPerPage={20} />` widget. See [`<Configure />` documentation](widgets/Configure.html)
 *
 * @name HitsPerPage
 * @kind widget
 * @propType {string} id - The id of the select input
 * @propType {{value: number, label: string}[]} items - List of available options.
 * @propType {number} defaultRefinement - The number of items selected by default
 * @propType {function} [transformItems] - Function to modify the items being displayed, e.g. for filtering or sorting them. Takes an items as parameter and expects it back in return.
 * @themeKey ais-HitsPerPage - the root div of the widget
 * @themeKey ais-HitsPerPage-select - the select
 * @themeKey ais-HitsPerPage-option - the select option
 * @example
 * import React from 'react';
 * import algoliasearch from 'algoliasearch/lite';
 * import { InstantSearch, HitsPerPage, Hits } from 'react-instantsearch-dom';
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
 *     <HitsPerPage
 *       defaultRefinement={5}
 *       items={[
 *         { value: 5, label: 'Show 5 hits' },
 *         { value: 10, label: 'Show 10 hits' },
 *       ]}
 *     />
 *     <Hits />
 *   </InstantSearch>
 * );
 */

export default connectHitsPerPage(HitsPerPage, {
  $$widgetType: 'ais.hitsPerPage',
});
