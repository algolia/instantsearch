import connectScrollTo from '../connectors/connectScrollTo.js';
import ScrollToComponent from '../components/ScrollTo.js';

/**
 * The ScrollTo component will made the page scroll to the component wrapped by it on a certain event.
 * @name ScrollTo
 * @kind component
 * @category widget
 * @propType {string} [scrollOn="p"] - Widget state key on which to listen for changes, default to the pagination widget.
 * @example
 * import React from 'react';
 *
 * import {ScrollTo, Hits, InstantSearch} from '../packages/react-instantsearch/dom';
 *
 * export default function App() {
 *   return (
 *     <InstantSearch
 *       className="container-fluid"
 *       appId="latency"
 *       apiKey="6be0576ff61c053d5f9a3225e2a90f76"
 *       indexName="ikea"
 *     >
 *       <ScrollTo >
 *            <Hits hitsPerPage={5}/>
 *       </ScrollTo>
 *     </InstantSearch>
 *   );
 * }
 */
export default connectScrollTo(ScrollToComponent);
