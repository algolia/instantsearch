import { connectToggleRefinement } from 'react-instantsearch-core';
import ToggleRefinement from '../components/ToggleRefinement';

/**
 * The ToggleRefinement provides an on/off filtering feature based on an attribute value.
 * @name ToggleRefinement
 * @kind widget
 * @requirements To use this widget, you'll need an attribute to toggle on.
 *
 * You can't toggle on null or not-null values. If you want to address this particular use-case you'll need to compute an
 * extra boolean attribute saying if the value exists or not. See this [thread](https://discourse.algolia.com/t/how-to-create-a-toggle-for-the-absence-of-a-string-attribute/2460) for more details.
 *
 * @propType {string} attribute - Name of the attribute on which to apply the `value` refinement. Required when `value` is present.
 * @propType {string} label - Label for the toggle.
 * @propType {any} value - Value of the refinement to apply on `attribute` when checked.
 * @propType {boolean} [defaultRefinement=false] - Default state of the widget. Should the toggle be checked by default?
 * @themeKey ais-ToggleRefinement - the root div of the widget
 * @themeKey ais-ToggleRefinement-list - the list of toggles
 * @themeKey ais-ToggleRefinement-item - the toggle list item
 * @themeKey ais-ToggleRefinement-label - the label of each toggle item
 * @themeKey ais-ToggleRefinement-checkbox - the checkbox input of each toggle item
 * @themeKey ais-ToggleRefinement-labelText - the label text of each toggle item
 * @themeKey ais-ToggleRefinement-count - the count of items for each item
 * @example
 * import React from 'react';
 * import { InstantSearch, ToggleRefinement } from 'react-instantsearch-dom';
 *
 * const App = () => (
 *   <InstantSearch
 *     appId="latency"
 *     apiKey="6be0576ff61c053d5f9a3225e2a90f76"
 *     indexName="ikea"
 *   >
 *     <ToggleRefinement
 *       attribute="materials"
 *       label="Made with solid pine"
 *       value="Solid pine"
 *     />
 *   </InstantSearch>
 * );
 */

export default connectToggleRefinement(ToggleRefinement);
