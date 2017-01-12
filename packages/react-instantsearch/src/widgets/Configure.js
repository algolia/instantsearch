import connectConfigure from '../connectors/connectConfigure';
import Configure from '../components/Configure';

/**
 * Configure is a non displayable widget that lets you provide parameters
 * for the Algolia queries.
 *
 * Any of the props added to this widget will be forwarded to Algolia. For more information
 * on the different parameters that can be set, have a look at the
 * [reference](https://www.algolia.com/doc/api-client/javascript/search#search-parameters).
 *
 * This widget can be used either with react-dom and react-native.
 * @name Configure
 * @kind widget
 * @example
 * import React from 'react';
 *
 * import {Configure} from '../packages/react-instantsearch/dom';
 *
 * export default function App() {
 *   return (
 *     <InstantSearch
 *       className="container-fluid"
 *       appId="latency"
 *       apiKey="6be0576ff61c053d5f9a3225e2a90f76"
 *       indexName="ikea"
 *     >
 *       <Configure distinct={1} />
 *     </InstantSearch>
 *   );
 * }
 */
export default connectConfigure(Configure);
