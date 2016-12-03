import connectToggle from '../connectors/connectToggle.js';
import ToggleComponent from '../components/Toggle.js';

/**
 * The Toggle provides an on/off filtering feature based on an attribute value. Note that if you provide an “off” option, it will be refined at initialization.
 * @name Toggle
 * @kind widget
 * @propType {string} attributeName - Name of the attribute on which to apply the `value` refinement. Required when `value` is present.
 * @propType {string} label - Label for this toggle.
 * @propType {string} function - Custom filter. Takes in a `SearchParameters` and returns a new `SearchParameters` with the filter applied.
 * @propType {string} value - Value of the refinement to apply on `attributeName`. Required when `attributeName` is present.
 * @propType {boolean} [defaultChecked=false] - Default state of the widget. Should the toggle be checked by default?
 * @themeKey ais-Toggle__root - the root of the component
 * @themeKey ais-Toggle__checkbox - the toggle checkbox
 * @themeKey ais-Toggle__label - the toggle label
 * @example
 * import React from 'react';
 *
 * import {Toggle, InstantSearch} from '../packages/react-instantsearch/dom';
 *
 * export default function App() {
 *   return (
 *     <InstantSearch
 *       className="container-fluid"
 *       appId="latency"
 *       apiKey="6be0576ff61c053d5f9a3225e2a90f76"
 *       indexName="ikea"
 *     >
 *       <Toggle attributeName="materials"
 *           label="Made with solid pine"
 *           value={'Solid pine'}
 *        />
 *     </InstantSearch>
 *   );
 * }
 */
export default connectToggle(ToggleComponent);
