import connectHighlight from '../connectors/connectHighlight.js';
import SnippetComponent from '../components/Snippet.js';

/**
 * Renders any attribute from an hit into its highlighted snippet form when relevant.
 *
 * Read more about it in the [Highlighting results](guide/Highlighting_results.html) guide.
 * @name Snippet
 * @kind widget
 * @requirements To use this widget, the attribute name passed to the `attributeName` prop must be
 * present in "Attributes to snippet" on the Algolia dashboard or configured as `attributesToSnippet`
 * via a set settings call to the Algolia API.
 * @propType {string} attributeName - location of the highlighted snippet attribute in the hit (the corresponding element can be either a string or an array of strings)
 * @propType {object} hit - hit object containing the highlighted snippet attribute
 * @propType {string} [tagName='em'] - tag to be used for highlighted parts of the attribute
 * @propType {string} [nonHighlightedTagName='span'] - tag to be used for the parts of the hit that are not highlighted
 * @propType {React.Element} [separatorComponent=',<space>'] - symbol used to separate the elements of the array in case the attributeName points to an array of strings.
 * @example
 * import React from 'react';
 * import { Snippet, InstantSearch, Hits } from 'react-instantsearch/dom';
 *
 * export default function App() {
 *   return (
 *     <InstantSearch
 *       appId="latency"
 *       apiKey="6be0576ff61c053d5f9a3225e2a90f76"
 *       indexName="ikea"
 *     >
 *       <Hits
 *         hitComponent={({ hit }) => (
 *           <p key={hit.objectID}>
 *             <Snippet attributeName="description" hit={hit} />
 *           </p>
 *         )}
 *       />
 *     </InstantSearch>
 *   );
 * }
 */
export default connectHighlight(SnippetComponent);
