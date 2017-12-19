import connectHighlight from '../connectors/connectHighlight.js';
import HighlightComponent from '../components/Highlight.js';

/**
 * Renders any attribute from a hit into its highlighted form when relevant.
 *
 * Read more about it in the [Highlighting results](guide/Highlighting_results.html) guide.
 * @name Highlight
 * @kind widget
 * @propType {string} attributeName - location of the highlighted attribute in the hit (the corresponding element can be either a string or an array of strings)
 * @propType {object} hit - hit object containing the highlighted attribute
 * @propType {string} [tagName='em'] - tag to be used for highlighted parts of the hit
 * @propType {string} [nonHighlightedTagName='span'] - tag to be used for the parts of the hit that are not highlighted
 * @propType {React.Element} [separatorComponent=','] - symbol used to separate the elements of the array in case the attributeName points to an array of strings.
 * @themeKey ais-Highlight - root of the component
 * @themeKey ais-Highlight__highlighted - part of the text that is highlighted
 * @themeKey ais-Highlight__nonHighlighted - part of the text that is non highlighted
 * @example
 * import React from 'react';
 *
 * import { connectHits, Highlight, InstantSearch } from 'react-instantsearch/dom';
 *
 * const CustomHits = connectHits(({ hits }) =>
 * <div>
 *   {hits.map(hit =>
 *     <p key={hit.objectID}>
 *       <Highlight attributeName="description" hit={hit} />
 *     </p>
 *   )}
 * </div>
 * );
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
