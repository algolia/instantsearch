import connectCurrentRefinements
  from '../connectors/connectCurrentRefinements.js';
import CurrentRefinementsComponent from '../components/CurrentRefinements.js';

/**
 * The CurrentRefinements widget displays the list of currently applied filters.
 *
 * It allows the user to selectively remove them.
 * @name CurrentRefinements
 * @kind widget
 * @propType {function} [transformItems] - Function to modify the items being displayed, e.g. for filtering or sorting them. Takes an items as parameter and expects it back in return.
 * @themeKey ais-CurrentRefinements__root - the root div of the widget
 * @themeKey ais-CurrentRefinements__items - the container of the filters
 * @themeKey ais-CurrentRefinements__item - a single filter
 * @themeKey ais-CurrentRefinements__itemLabel - the label of a filter
 * @themeKey ais-CurrentRefinements__itemClear - the trigger to remove the filter
 * @themeKey ais-CurrentRefinements__noRefinement - present when there is no refinement
 * @translationKey clearFilter - the remove filter button label
 * @example
 * import React from 'react';
 *
 * import {ClearAll, RefinementList} from '../packages/react-instantsearch/dom';
 *
 * export default function App() {
 *   return (
 *     <InstantSearch
 *       appId="latency"
 *       apiKey="6be0576ff61c053d5f9a3225e2a90f76"
 *       indexName="ikea"
 *     >
 *       <CurrentRefinements />
 *       <RefinementList
          attributeName="colors"
          defaultRefinement={['Black']}
        />
 *     </InstantSearch>
 *   );
 * }
 */
export default connectCurrentRefinements(CurrentRefinementsComponent);
