import connectConfigure from '../connectors/connectConfigure';

/**
 * Configure is a widget that lets you provide raw search parameters
 * to the Algolia API.
 *
 * Any of the props added to this widget will be forwarded to Algolia. For more information
 * on the different parameters that can be set, have a look at the
 * [reference](https://www.algolia.com/doc/api-client/javascript/search#search-parameters).
 *
 * This widget can be used either with react-dom and react-native. It will not render anything
 * on screen, only configure some parameters.
 *
 * Read more in the [Search parameters](guide/Search_parameters.html) guide.
 * @name Configure
 * @kind widget
 * @example
 * import React from 'react';
 * import { InstantSearch, Configure, Hits } from 'react-instantsearch-dom';
 *
 * const App = () => (
 *   <InstantSearch
 *     appId="latency"
 *     apiKey="6be0576ff61c053d5f9a3225e2a90f76"
 *     indexName="instant_search"
 *   >
 *     <Configure hitsPerPage={5} />
 *     <Hits />
 *   </InstantSearch>
 * );
 */

export default connectConfigure(() => null);
