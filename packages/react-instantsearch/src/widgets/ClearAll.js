import connectCurrentRefinements from '../connectors/connectCurrentRefinements.js';
import ClearAllComponent from '../components/ClearAll.js';

/**
 * The ClearAll widget displays a button that lets the user clean every refinement applied
 * to the search.
 * @name ClearAll
 * @kind widget
 * @propType {function} [transformItems] - If provided, this function can be used to modify the `items` provided prop of the wrapped component (ex: for filtering or sorting items). this function takes the `items` prop as a parameter and expects it back in return.
 * @themeKey ais-ClearAll__root - the widget button
 * @translationKey reset - the clear all button value
 * @example
 * import React from 'react';
 *
 * import {ClearAll, RefinementList} from '../packages/react-instantsearch/dom';
 *
 * export default function App() {
 *   return (
 *     <InstantSearch
 *       className="container-fluid"
 *       appId="latency"
 *       apiKey="6be0576ff61c053d5f9a3225e2a90f76"
 *       indexName="ikea"
 *     >
 *       <ClearAll />
 *       <RefinementList
          attributeName="colors"
          defaultRefinement={['Black']}
        />
 *     </InstantSearch>
 *   );
 * }
 */
export default connectCurrentRefinements(ClearAllComponent);
