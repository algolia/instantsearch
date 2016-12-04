import connectInfiniteHits from '../connectors/connectInfiniteHits.js';
import InfiniteHitsComponent from '../components/InfiniteHits.js';

/**
 * Displays the list of hits for the current search parameters. This widget
 * will also render a **load more** button that will add one to the current
 * page and will trigger the search. The new results will be append in the
 * list of results.
 * @name InfiniteHits
 * @kind widget
 * @propType {number} hitsPerPage - How many hits should be displayed for every page.
 *   Ignored when a `HitsPerPage` component is also present.
 * @propType {Component} itemComponent - Component used for rendering each hit from
 *   the results. If it is not provided the rendering defaults to displaying the
 *   hit in its JSON form. The component will be called with a `hit` prop.
 * @themeKey root - the root of the component
 * @example
 * import React from 'react';

 * import {
 *   InstantSearch,
 *   Hits,
 * } from 'react-instantsearch/dom';
 *
 * export default function App() {
 *   return (
 *     <InstantSearch
 *       className="container-fluid"
 *       appId="latency"
 *       apiKey="6be0576ff61c053d5f9a3225e2a90f76"
 *       indexName="ikea"
 *     >
 *       <InfiniteHits />
 *     </InstantSearch>
 *   );
 * }
 */
export default connectInfiniteHits(InfiniteHitsComponent);
