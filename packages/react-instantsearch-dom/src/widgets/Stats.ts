import { connectStats } from 'react-instantsearch-core';

import Stats from '../components/Stats';

/**
 * The Stats component displays the total number of matching hits and the time it took to get them (time spent in the Algolia server) if `relevancyStrictness` is `undefined`. Displays the total number of matching sorted hits out of the matching hits and the time it took to get them (time spent in the Algolia server) otherwise.
 * @name Stats
 * @kind widget
 * @themeKey ais-Stats - the root div of the widget
 * @themeKey ais-Stats-text - the text of the widget - the count of items for each item
 * @translationkey stats - The string displayed by the stats widget. You get function(n, ms, nSorted, areHitsSorted) and you need to return a string. `n` is a number of hits retrieved, `ms` is a processed time, `nSorted` is a number of sorted hits retrieved, `areHitsSorted` is a boolean translating a `relevancyStrictness` set between 0 and 100.
 * @example
 * import React from 'react';
 * import { InstantSearch, Stats, Hits } from 'react-instantsearch-dom';
 * import algoliasearch from 'algoliasearch/lite';
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
 *     <Stats />
 *     <Hits />
 *   </InstantSearch>
 * );
 */

export default connectStats(Stats, { $$widgetType: 'ais.stats' });
