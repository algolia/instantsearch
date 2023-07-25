import { connectScrollTo } from 'react-instantsearch-core';

import ScrollTo from '../components/ScrollTo';

/**
 * The ScrollTo component will make the page scroll to the component wrapped by it when one of the
 * [search state](guide/Search_state.html) prop is updated. By default when the page number changes,
 * the scroll goes to the wrapped component.
 *
 * @name ScrollTo
 * @kind widget
 * @propType {string} [scrollOn="page"] - Widget state key on which to listen for changes.
 * @themeKey ais-ScrollTo - the root div of the widget
 * @example
 * import React from 'react';
 * import algoliasearch from 'algoliasearch/lite';
 * import { InstantSearch, ScrollTo, Hits } from 'react-instantsearch-dom';
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
 *     <ScrollTo>
 *       <Hits />
 *     </ScrollTo>
 *   </InstantSearch>
 * );
 */
export default connectScrollTo(ScrollTo, { $$widgetType: 'ais.scrollTo' });
