import connectScrollTo from '../connectors/connectScrollTo.js';
import ScrollToComponent from '../components/ScrollTo.js';

/**
 * The ScrollTo component will made the page scroll to the component wrapped by it when one of the
 * [search state](guide/Search_state.html) prop is updated. By default when the page number changes,
 * the scroll goes to the wrapped component.
 *
 * @name ScrollTo
 * @kind widget
 * @propType {string} [scrollOn="page"] - Widget state key on which to listen for changes.
 * @example
 * import React from 'react';
 *
 * import {ScrollTo, Hits, InstantSearch} from '../packages/react-instantsearch/dom';
 *
 * export default function App() {
 *   return (
 *     <InstantSearch
 *       appId="latency"
 *       apiKey="6be0576ff61c053d5f9a3225e2a90f76"
 *       indexName="ikea"
 *     >
 *       <ScrollTo>
 *            <Hits />
 *       </ScrollTo>
 *     </InstantSearch>
 *   );
 * }
 */
export default connectScrollTo(ScrollToComponent);
