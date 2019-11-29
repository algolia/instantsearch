/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import ToggleRefinement from '../../components/ToggleRefinement/ToggleRefinement';
import connectToggleRefinement from '../../connectors/toggle-refinement/connectToggleRefinement';
import defaultTemplates from './defaultTemplates';
import {
  getContainerNode,
  prepareTemplateProps,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';

const withUsage = createDocumentationMessageGenerator({
  name: 'toggle-refinement',
});
const suit = component('ToggleRefinement');

const renderer = ({ containerNode, cssClasses, renderState, templates }) => (
  { value, createURL, refine, instantSearchInstance },
  isFirstRendering
) => {
  if (isFirstRendering) {
    renderState.templateProps = prepareTemplateProps({
      defaultTemplates,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
    });

    return;
  }

  render(
    <ToggleRefinement
      createURL={createURL}
      cssClasses={cssClasses}
      currentRefinement={value}
      templateProps={renderState.templateProps}
      refine={isRefined => refine({ isRefined })}
    />,
    containerNode
  );
};

/**
 * @typedef {Object} ToggleWidgetCSSClasses
 * @property {string|string[]} [root] CSS class to add to the root element.
 * @property {string|string[]} [label] CSS class to add to the label wrapping element
 * @property {string|string[]} [checkbox] CSS class to add to the checkbox
 * @property {string|string[]} [labelText] CSS class to add to the label text.
 */

/**
 * @typedef {Object} ToggleWidgetTemplates
 * @property {string|function(object):string} labelText the text that describes the toggle action. This
 * template receives some contextual information:
 *  - `isRefined` which is `true` if the checkbox is checked
 *  - `count` - the count of the values if the toggle in the next refinements
 *  - `onFacetValue`, `offFacetValue`: objects with `count` (useful to get the other value of `count`)
 */

/**
 * @typedef {Object} ToggleWidgetOptions
 * @property {string|HTMLElement} container Place where to insert the widget in your webpage.
 * @property {string} attribute Name of the attribute for faceting (eg. "free_shipping").
 * @property {string|number|boolean} on Value to filter on when checked.
 * @property {string|number|boolean} off Value to filter on when unchecked.
 * element (when using the default template). By default when switching to `off`, no refinement will be asked. So you
 * will get both `true` and `false` results. If you set the off value to `false` then you will get only objects
 * having `false` has a value for the selected attribute.
 * @property {ToggleWidgetTemplates} [templates] Templates to use for the widget.
 * @property {ToggleWidgetCSSClasses} [cssClasses] CSS classes to add.
 */

/**
 * The toggleRefinement widget lets the user either:
 *  - switch between two values for a single facetted attribute (free_shipping / not_free_shipping)
 *  - toggleRefinement a faceted value on and off (only 'canon' for brands)
 *
 * This widget is particularly useful if you have a boolean value in the records.
 *
 * @requirements
 * The attribute passed to `attribute` must be declared as an
 * [attribute for faceting](https://www.algolia.com/doc/guides/searching/faceting/#declaring-attributes-for-faceting)
 * in your Algolia settings.
 *
 * @type {WidgetFactory}
 * @devNovel ToggleRefinement
 * @category filter
 * @param {ToggleWidgetOptions} $0 Options for the ToggleRefinement widget.
 * @return {Widget} A new instance of the ToggleRefinement widget
 * @example
 * search.addWidgets([
 *   instantsearch.widgets.toggleRefinement({
 *     container: '#free-shipping',
 *     attribute: 'free_shipping',
 *     on: true,
 *     templates: {
 *       labelText: 'Free shipping'
 *     }
 *   })
 * ]);
 */
export default function toggleRefinement({
  container,
  attribute,
  cssClasses: userCssClasses = {},
  templates = defaultTemplates,
  on = true,
  off,
} = {}) {
  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    label: cx(suit({ descendantName: 'label' }), userCssClasses.label),
    checkbox: cx(suit({ descendantName: 'checkbox' }), userCssClasses.checkbox),
    labelText: cx(
      suit({ descendantName: 'labelText' }),
      userCssClasses.labelText
    ),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    renderState: {},
    templates,
  });

  const makeWidget = connectToggleRefinement(specializedRenderer, () =>
    render(null, containerNode)
  );

  return makeWidget({ attribute, on, off });
}
