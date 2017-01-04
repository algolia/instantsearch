import connectHighlight from '../connectors/connectHighlight.js';
import SnippetComponent from '../components/Snippet.js';

/**
 * Renders an highlighted snippet attribute.
 * @name Snippet
 * @kind widget
 * @propType {string} attributeName - the location of the highlighted snippet attribute in the hit
 * @propType {object} hit - the hit object containing the highlighted snippet attribute
 * @example
 * import React from 'react';
 *
 * import {InstantSearch, connectHits, Snippet} from 'InstantSearch';
 *
 * const CustomHits = connectHits(hits => {
 *  return hits.map((hit) => <p><Snippet attributeName='description' hit={hit}/></p>);
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
export default connectHighlight(SnippetComponent);
