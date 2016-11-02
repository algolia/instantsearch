import connectRange from '../connectors/connectRange.js';
import RangeRatingsComponent from '../components/RangeRatings.js';

/**
 * RangeRatings is a widget that allows a user to select a numeric range using inputs.
 * @name RangeRatings
 * @kind component
 * @category widget
 * @propType {string} id - widget id, defaults to the attribute name
 * @propType {string} attributeName - the name of the attribute in the record
 * @propType {number} min - Minimum value for the rating. When this isn't set, the minimum value will be automatically computed by Algolia using the data in the index.
 * @propType {number} max - Maximum value for the rating. When this isn't set, the maximum value will be automatically computed by Algolia using the data in the index.
 * @propType {{min: number, max: number}} defaultRefinement - Default state of the widget containing the lower bound (end) and the max for the rating.
 * @themeKey ais-RangeRatings__root - The root component of the widget
 * @themeKey ais-RangeRatings__ratingLink - The item link
 * @themeKey ais-RangeRatings__ratingLinkSelected - The selected link item
 * @themeKey ais-RangeRatings__ratingLinkDisabled - The disabled link item
 * @themeKey ais-RangeRatings__ratingIcon - The rating icon
 * @themeKey ais-RangeRatings__ratingIconSelected - The selected rating icon
 * @themeKey ais-RangeRatings__ratingIconDisabled - The disabled rating icon
 * @themeKey ais-RangeRatings__ratingIconEmpty - The rating empty icon
 * @themeKey ais-RangeRatings__ratingIconEmptySelected - The selected rating empty icon
 * @themeKey ais-RangeRatings__ratingIconEmptyDisabled - The disabled rating empty icon
 * @themeKey ais-RangeRatings__ratingLabel - The link label
 * @themeKey ais-RangeRatings__ratingLabelSelected - The selected link label
 * @themeKey ais-RangeRatings__ratingLabelDisabled - The disabled link label
 * @themeKey ais-RangeRatings__ratingCount - The link count
 * @themeKey ais-RangeRatings__ratingCountSelected - The selected link count
 * @themeKey ais-RangeRatings__ratingCountDisabled - The disabled link count
 * @translationKey ratingLabel - Label value for the rating link
 * @example
 * import React from 'react';
 *
 * import {RangeRatings, InstantSearch} from '../packages/react-instantsearch/dom';
 *
 * export default function App() {
 *   return (
 *     <InstantSearch
 *       className="container-fluid"
 *       appId="latency"
 *       apiKey="6be0576ff61c053d5f9a3225e2a90f76"
 *       indexName="ikea"
 *     >
 *       <RangeRatings attributeName="rating" />
 *     </InstantSearch>
 *   );
 * }
 */
export default connectRange(RangeRatingsComponent);
