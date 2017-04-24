import connectHighlight from '../connectors/connectHighlight.js';
import HighlightComponent from '../components/Highlight.js';

/**
 * Renders any attribute from an hit into its highlighted form when relevant.
 *
 * Read more about it in the [Highlighting results](guide/Highlighting_results.html) guide.
 * @name Highlight
 * @kind widget
 * @propType {string} attributeName - the location of the highlighted attribute in the hit
 * @propType {object} hit - the hit object containing the highlighted attribute
 * @propType {string} [tagName='em'] - the tag to be used for highlighted parts of the hit
 * @example
 * import React from 'react';
 *
 * import { connectHits, Highlight, InstantSearch } from 'react-instantsearch/dom';
 *
 * const CustomHits = connectHits(hits => {
 *  return hits.map((hit) => <p><Highlight attributeName="description" hit={hit}/></p>);
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
