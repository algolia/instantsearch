import React from 'react';
import { connectRange } from 'react-instantsearch-core';

import PanelCallbackHandler from '../components/PanelCallbackHandler';
import RangeInput from '../components/RangeInput';

/**
 * RangeInput allows a user to select a numeric range using a minimum and maximum input.
 * @name RangeInput
 * @kind widget
 * @requirements The attribute passed to the `attribute` prop must be present in “attributes for faceting”
 * on the Algolia dashboard or configured as `attributesForFaceting` via a set settings call to the Algolia API.
 * The values inside the attribute must be JavaScript numbers (not strings).
 * @propType {string} attribute - the name of the attribute in the record
 * @propType {{min: number, max: number}} [defaultRefinement] - Default state of the widget containing the start and the end of the range.
 * @propType {number} [min] - Minimum value. When this isn't set, the minimum value will be automatically computed by Algolia using the data in the index.
 * @propType {number} [max] - Maximum value. When this isn't set, the maximum value will be automatically computed by Algolia using the data in the index.
 * @propType {number} [precision=0] - Number of digits after decimal point to use.
 * @themeKey ais-RangeInput - the root div of the widget
 * @themeKey ais-RangeInput-form - the wrapping form
 * @themeKey ais-RangeInput-label - the label wrapping inputs
 * @themeKey ais-RangeInput-input - the input (number)
 * @themeKey ais-RangeInput-input--min - the minimum input
 * @themeKey ais-RangeInput-input--max - the maximum input
 * @themeKey ais-RangeInput-separator - the separator word used between the two inputs
 * @themeKey ais-RangeInput-button - the submit button
 * @translationKey submit - Label value for the submit button
 * @translationKey separator - Label value for the input separator
 * @example
 * import React from 'react';
 * import algoliasearch from 'algoliasearch/lite';
 * import { InstantSearch, RangeInput } from 'react-instantsearch-dom';
 *
 * const searchClient = algoliasearch(
 *   'latency',
 *   '6be0576ff61c053d5f9a3225e2a90f76'
 * );
 *
 * const App = () => (
 *   <InstantSearch
 *     searchClient={searchClient}
 *     indexName="instant_search"
 *   >
 *     <RangeInput attribute="price" />
 *   </InstantSearch>
 * );
 */

const RangeInputWidget = (props) => (
  <PanelCallbackHandler {...props}>
    <RangeInput {...props} />
  </PanelCallbackHandler>
);

export default connectRange(RangeInputWidget, {
  $$widgetType: 'ais.rangeInput',
});
