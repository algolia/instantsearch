import { connectInfiniteHits } from 'react-instantsearch-core';

import InfiniteHits from '../components/InfiniteHits';

/**
 * Displays an infinite list of hits along with a **load more** button.
 *
 * To configure the number of hits being shown, use the [HitsPerPage widget](widgets/HitsPerPage.html),
 * [connectHitsPerPage connector](connectors/connectHitsPerPage.html) or the [Configure widget](widgets/Configure.html).
 *
 * @name InfiniteHits
 * @kind widget
 * @propType {Component} [hitComponent] - Component used for rendering each hit from
 *   the results. If it is not provided the rendering defaults to displaying the
 *   hit in its JSON form. The component will be called with a `hit` prop.
 * @themeKey ais-InfiniteHits - the root div of the widget
 * @themeKey ais-InfiniteHits-list - the list of hits
 * @themeKey ais-InfiniteHits-item - the hit list item
 * @themeKey ais-InfiniteHits-loadMore - the button used to display more results
 * @themeKey ais-InfiniteHits-loadMore--disabled - the disabled button used to display more results
 * @translationKey loadMore - the label of load more button
 * @example
 * import React from 'react';
 * import algoliasearch from 'algoliasearch/lite';
 * import { InstantSearch, InfiniteHits } from 'react-instantsearch-dom';
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
 *     <InfiniteHits />
 *   </InstantSearch>
 * );
 */

export default connectInfiniteHits(InfiniteHits, {
  $$widgetType: 'ais.infiniteHits',
});
