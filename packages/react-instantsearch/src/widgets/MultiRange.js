import connectMultiRange from '../connectors/connectMultiRange.js';
import MultiRangeComponent from '../components/MultiRange.js';

/**
 * MultiRange is a widget used for selecting the range value of a numeric attribute.
 * @name MultiRange
 * @kind widget
 * @propType {string} attributeName - the name of the attribute in the records
 * @propType {{label: string, start: number, end: number}[]} items - List of options. With a text label, and upper and lower bounds.
 * @propType {string} defaultRefinement - the value of the item selected by default, follow the format "min:max".
 * @propType {function} [transformItems] - If provided, this function can be used to modify the `items` provided prop of the wrapped component (ex: for filtering or sorting items). this function takes the `items` prop as a parameter and expects it back in return.
 * @themeKey ais-MultiRange__root - The root component of the widget
 * @themeKey ais-MultiRange__items - The container of the items
 * @themeKey ais-MultiRange__item - A single item
 * @themeKey ais-MultiRange__itemSelected - The selected item
 * @themeKey ais-MultiRange__itemLabel - The label of an item
 * @themeKey ais-MultiRange__itemLabelSelected - The selected label item
 * @themeKey ais-MultiRange__itemRadio - The radio of an item
 * @themeKey ais-MultiRange__itemRadioSelected - The selected radio item
 * @themeKey ais-MultiRange__noRefinement - present when there is no refinement
 * @example
 * import React from 'react';
 *
 * import {InstantSearch, MultiRange} from '../packages/react-instantsearch/dom';
 *
 * export default function App() {
 *   return (
 *     <InstantSearch
 *       className="container-fluid"
 *       appId="latency"
 *       apiKey="6be0576ff61c053d5f9a3225e2a90f76"
 *       indexName="ikea"
 *     >
 *       <MultiRange attributeName="price"
 *           items={[
 *             {end: 10, label: '<$10'},
 *             {start: 10, end: 100, label: '$10-$100'},
 *             {start: 100, end: 500, label: '$100-$500'},
 *             {start: 500, label: '>$500'},
 *           ]}
 *        />
 *     </InstantSearch>
 *   );
 * }
 */
export default connectMultiRange(MultiRangeComponent);
