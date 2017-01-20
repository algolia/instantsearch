import Panel from '../components/Panel.js';

/**
 * The Panel widget wraps other widgets with a consistent panel design. It also reacts, indicates and set CSS classes when widgets are no more relevant for refining (like when a RefinementList becomes empty because of the current search).
 * @name Panel
 * @kind widget
 * @propType {string} title - The panel title
 * @themeKey ais-Panel__root - Container of the widget
 * @themeKey ais-Panel__title - The panel title
 * @themeKey ais-Panel__noRefinement - Present if the panel content is empty
* @example
 * import React from 'react';
 *
 * import {Panel, RefinementList, InstantSearch} from '../packages/react-instantsearch/dom';
 *
 * export default function App() {
 *   return (
 *     <InstantSearch
 *       className="container-fluid"
 *       appId="latency"
 *       apiKey="6be0576ff61c053d5f9a3225e2a90f76"
 *       indexName="ikea"
 *     >
 *       <Panel title="category">
 *            <RefinementList attributeName="category" />
 *       </Panel>
 *     </InstantSearch>
 *   );
 * }
 */
export default Panel;
