import connectHighlight from '../connectors/connectHighlight.js';
import HighlightComponent from '../components/Highlight.js';

/**
 * Renders an highlighted attribute.
 * @name Highlight
 * @kind component
 * @category widget
 * @propType {string} attributeName - the location of the highlighted attribute in the hit
 * @propType {object} hit - the hit object containing the highlighted attribute
 * @example
 * import React from 'react';
 *
 * import {InstantSearch, connectHits, Highlight} from 'InstantSearch';
 *
 * const CustomHits = connectHits(hits => {
 *  return hits.map((hit) => <p><Highlight attributeName='description' hit={hit}/></p>);
 * });
 *
 * export default function App() {
 *  return (
 *    <InstantSearch
 *       appId="latency"
 *       apiKey="6be0576ff61c053d5f9a3225e2a90f76"
 *       indexName="ikea"
 *     >
 *       <CustomHits />
 *     </InstantSearch>
 *  );
 * }
 */
export default connectHighlight(HighlightComponent);
