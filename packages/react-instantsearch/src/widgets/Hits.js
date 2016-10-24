import connectHits from '../connectors/connectHits.js';
import HitsComponent from '../components/Hits.js';

/**
 * Displays the list of hits for the current search parameters.
 * @name Hits
 * @kind component
 * @category widget
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
 *       <Hits />
 *     </InstantSearch>
 *   );
 * }
 */
export default connectHits(HitsComponent);
