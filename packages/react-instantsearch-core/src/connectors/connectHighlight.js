import createConnector from '../core/createConnector';
import { HIGHLIGHT_TAGS, parseAlgoliaHit } from '../core/highlight';

const highlight = ({
  attribute,
  hit,
  highlightProperty,
  preTag = HIGHLIGHT_TAGS.highlightPreTag,
  postTag = HIGHLIGHT_TAGS.highlightPostTag,
}) =>
  parseAlgoliaHit({
    attribute,
    highlightProperty,
    hit,
    preTag,
    postTag,
  });

/**
 * connectHighlight connector provides the logic to create an highlighter
 * component that will retrieve, parse and render an highlighted attribute
 * from an Algolia hit.
 * @name connectHighlight
 * @kind connector
 * @category connector
 * @providedPropType {function} highlight - function to retrieve and parse an attribute from a hit. It takes a configuration object with 3 attributes: `highlightProperty` which is the property that contains the highlight structure from the records, `attribute` which is the name of the attribute (it can be either a string or an array of strings) to look for and `hit` which is the hit from Algolia. It returns an array of objects `{value: string, isHighlighted: boolean}`. If the element that corresponds to the attribute is an array of strings, it will return a nested array of objects.
 * @example
 * import React from 'react';
 * import { InstantSearch, SearchBox, Hits, connectHighlight } from 'react-instantsearch-dom';
 *
 * const CustomHighlight = connectHighlight(
 *   ({ highlight, attribute, hit, highlightProperty }) => {
 *     const highlights = highlight({
 *       highlightProperty: '_highlightResult',
 *       attribute,
 *       hit
 *     });
 *
 *     return highlights.map(part => part.isHighlighted ? (
 *       <mark>{part.value}</mark>
 *     ) : (
 *       <span>{part.value}</span>
 *     ));
 *   }
 * );
 *
 * const Hit = ({ hit }) => (
 *   <p>
 *     <CustomHighlight attribute="name" hit={hit} />
 *   </p>
 * );
 *
 * const App = () => (
 *   <InstantSearch
 *     appId="latency"
 *     apiKey="6be0576ff61c053d5f9a3225e2a90f76"
 *     indexName="ikea"
 *   >
 *     <SearchBox defaultRefinement="legi" />
 *     <Hits hitComponent={Hit} />
 *   </InstantSearch>
 * );
 */
export default createConnector({
  displayName: 'AlgoliaHighlighter',

  propTypes: {},

  getProvidedProps() {
    return { highlight };
  },
});
