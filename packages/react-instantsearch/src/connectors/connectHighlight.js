import createConnector from '../core/createConnector';
import parseAlgoliaHit from '../core/highlight';

import highlightTags from '../core/highlightTags.js';

const highlight = ({attributeName, hit}) => parseAlgoliaHit({
  attributeName,
  hit,
  preTag: highlightTags.highlightPreTag,
  postTag: highlightTags.highlightPostTag,
});

/**
 * connectHighlight connector provides the logic to create an highlighter
 * component that will retrieve, parse and render an highlighted attribute
 * from an Algolia hit.
 * @name connectHighlight
 * @kind connector
 * @category connector
 * @providedPropType {function} highlight - the function to retrieve and parse an attribute from a hit. It takes a configuration object with 2 attribute: `attributeName` which is the path to the attribute in the record, and `hit` which is the hit from Algolia. It returns an array of object `{value: string, isHighlighted: boolean}`.
 * @example
 * const CustomHighlight = connectHighlight(({highlight, attributeName, hit) => {
 *   const parsedHit = highlight({attributeName, hit});
 *   return parsedHit.map(part => {
 *     if(part.isHighlighted) return <em>{part.value}</em>;
 *     return part.value:
 *   });
 * });
 */
export default createConnector({
  displayName: 'AlgoliaHighlighter',

  propTypes: {},

  getProvidedProps() {
    return {highlight};
  },
});
