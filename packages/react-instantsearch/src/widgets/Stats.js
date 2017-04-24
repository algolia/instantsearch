import connectStats from '../connectors/connectStats.js';
import StatsComponent from '../components/Stats.js';

/**
 * The Stats component displays the total number of matching hits and the time it took to get them (time spent in the Algolia server).
 * @name Stats
 * @kind widget
 * @themeKey ais-Stats__root - the root of the component
 * @translationkey stats - The string displayed by the stats widget. You get function(n, ms) and you need to return a string. n is a number of hits retrieved, ms is a processed time.
 * @example
 * import React from 'react';
 *
 * import { Stats, InstantSearch } from 'react-instantsearch/dom';
 *
 * export default function App() {
 *   return (
 *     <InstantSearch
 *       appId="latency"
 *       apiKey="6be0576ff61c053d5f9a3225e2a90f76"
 *       indexName="ikea"
 *     >
 *       <Stats />
 *     </InstantSearch>
 *   );
 * }
 */
export default connectStats(StatsComponent);
