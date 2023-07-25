import React from 'react';
import { connectNumericMenu } from 'react-instantsearch-core';

import NumericMenu from '../components/NumericMenu';
import PanelCallbackHandler from '../components/PanelCallbackHandler';

/**
 * NumericMenu is a widget used for selecting the range value of a numeric attribute.
 * @name NumericMenu
 * @kind widget
 * @requirements The attribute passed to the `attribute` prop must be holding numerical values.
 * @propType {string} attribute - the name of the attribute in the records
 * @propType {{label: string, start: number, end: number}[]} items - List of options. With a text label, and upper and lower bounds.
 * @propType {string} [defaultRefinement] - the value of the item selected by default, follow the format "min:max".
 * @propType {function} [transformItems] - Function to modify the items being displayed, e.g. for filtering or sorting them. Takes an items as parameter and expects it back in return.
 * @themeKey ais-NumericMenu - the root div of the widget
 * @themeKey ais-NumericMenu--noRefinement - the root div of the widget when there is no refinement
 * @themeKey ais-NumericMenu-list - the list of all refinement items
 * @themeKey ais-NumericMenu-item - the refinement list item
 * @themeKey ais-NumericMenu-item--selected - the selected refinement list item
 * @themeKey ais-NumericMenu-label - the label of each refinement item
 * @themeKey ais-NumericMenu-radio - the radio input of each refinement item
 * @themeKey ais-NumericMenu-labelText - the label text of each refinement item
 * @translationkey all - The label of the largest range added automatically by react instantsearch
 * @example
 * import React from 'react';
 * import algoliasearch from 'algoliasearch/lite';
 * import { InstantSearch, NumericMenu } from 'react-instantsearch-dom';
 *
 * const searchClient = algoliasearch(
 *   'latency',
 *   '6be0576ff61c053d5f9a3225e2a90f76'
 * );
 *
 * const App = () => (
 *   <InstantSearch
 *     searchClient
 *     indexName="instant_search"
 *   >
 *     <NumericMenu
 *       attribute="price"
 *       items={[
 *         { end: 10, label: '< $10' },
 *         { start: 10, end: 100, label: '$10 - $100' },
 *         { start: 100, end: 500, label: '$100 - $500' },
 *         { start: 500, label: '> $500' },
 *       ]}
 *     />
 *   </InstantSearch>
 * );
 */

const NumericMenuWidget = (props) => (
  <PanelCallbackHandler {...props}>
    <NumericMenu {...props} />
  </PanelCallbackHandler>
);

export default connectNumericMenu(NumericMenuWidget, {
  $$widgetType: 'ais.numericMenu',
});
