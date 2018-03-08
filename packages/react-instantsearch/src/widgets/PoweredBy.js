import connectPoweredBy from '../connectors/connectPoweredBy.js';
import PoweredByComponent from '../components/PoweredBy.js';

/**
 * PoweredBy displays an Algolia logo.
 *
 * Algolia requires that you use this widget if you are on a [community or free plan](https://www.algolia.com/pricing).
 * @name PoweredBy
 * @kind widget
 * @themeKey ais-PoweredBy - the root div of the widget
 * @themeKey ais-PoweredBy-text - the text of the widget
 * @themeKey ais-PoweredBy-link - the link of the logo
 * @themeKey ais-PoweredBy-logo - the logo of the widget
 * @translationKey searchBy - Label value for the powered by
 * @example
 * import React from 'react';
 * import { InstantSearch, PoweredBy } from 'react-instantsearch/dom';
 *
 * const App = () => (
 *   <InstantSearch
 *     appId="latency"
 *     apiKey="6be0576ff61c053d5f9a3225e2a90f76"
 *     indexName="ikea"
 *   >
 *     <PoweredBy />
 *   </InstantSearch>
 * );
 */
export default connectPoweredBy(PoweredByComponent);
