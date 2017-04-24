import connectPoweredBy from '../connectors/connectPoweredBy.js';
import PoweredByComponent from '../components/PoweredBy.js';

/**
 * PoweredBy displays an Algolia logo.
 *
 * Algolia requires that you use this widget if you are on a [community or free plan](https://www.algolia.com/pricing).
 * @name PoweredBy
 * @kind widget
 * @themeKey ais-PoweredBy__root - The root component of the widget
 * @themeKey ais-PoweredBy__searchBy - The powered by label
 * @themeKey ais-PoweredBy__algoliaLink - The algolia logo link
 * @translationKey searchBy - Label value for the powered by
 * @example
 * import React from 'react';
 *
 * import { PoweredBy, InstantSearch } from 'react-instantsearch/dom';
 *
 * export default function App() {
 *   return (
 *     <InstantSearch
 *       appId="latency"
 *       apiKey="6be0576ff61c053d5f9a3225e2a90f76"
 *       indexName="ikea"
 *     >
 *       <PoweredBy />
 *     </InstantSearch>
 *   );
 * }
 */
export default connectPoweredBy(PoweredByComponent);
