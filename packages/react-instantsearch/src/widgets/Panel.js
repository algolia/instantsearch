import Panel from '../components/Panel';

/**
 * The Panel widget wraps other widgets in a consistent panel design.
 * It also reacts, indicates and set CSS classes when widgets are no more relevant for refining.
 * E.g. when a RefinementList becomes empty because of the current search results.
 *
 * @name Panel
 * @kind widget
 * @propType {string} [className] - Adds a className on the root element.
 * @propType {node} [header] - Adds a header to the widget.
 * @propType {node} [footer] - Adds a footer to the widget.
 * @themeKey ais-Panel - the root div of the Panel
 * @themeKey ais-Panel--noRefinement - the root div of the Panel without refinement
 * @themeKey ais-Panel-header - the header of the Panel (optional)
 * @themeKey ais-Panel-body - the body of the Panel
 * @themeKey ais-Panel-footer - the footer of the Panel (optional)
 * @example
 * import React from 'react';
 *
 * import { Panel, InstantSearch } from 'react-instantsearch/dom';
 * import { connectRefinementList } from 'react-instantsearch/connectors';
 *
 * const CustomRefinementList = connectRefinementList(() => (
 *   <div>My custom refinement list</div>
 * ));
 *
 * export default function App() {
 *   return (
 *     <InstantSearch
 *       appId="latency"
 *       apiKey="6be0576ff61c053d5f9a3225e2a90f76"
 *       indexName="ikea"
 *     >
 *       <Panel heade="Category">
 *         <CustomRefinementList attribute="category" />
 *       </Panel>
 *     </InstantSearch>
 *   );
 * }
 */

export default Panel;
