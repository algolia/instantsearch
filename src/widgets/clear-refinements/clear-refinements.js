/** @jsx h */

import { h, render } from 'preact';
import ClearRefinements from '../../components/ClearRefinements/ClearRefinements';
import cx from 'classnames';
import connectClearRefinements from '../../connectors/clear-refinements/connectClearRefinements';
import defaultTemplates from './defaultTemplates';
import {
  getContainerNode,
  prepareTemplateProps,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';

const withUsage = createDocumentationMessageGenerator({
  name: 'clear-refinements',
});
const suit = component('ClearRefinements');

const renderer = ({ containerNode, cssClasses, renderState, templates }) => (
  { refine, hasRefinements, instantSearchInstance },
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
    <ClearRefinements
      refine={refine}
      cssClasses={cssClasses}
      hasRefinements={hasRefinements}
      templateProps={renderState.templateProps}
    />,
    containerNode
  );
};

/**
 * @typedef {Object} ClearRefinementsCSSClasses
 * @property {string|string[]} [root] CSS class to add to the wrapper element.
 * @property {string|string[]} [button] CSS class to add to the button of the widget.
 * @property {string|string[]} [disabledButton] CSS class to add to the button when there are no refinements.
 */

/**
 * @typedef {Object} ClearRefinementsTemplates
 * @property {string|string[]} [resetLabel] Template for the content of the button
 */

/**
 * @typedef {Object} ClearRefinementsWidgetOptions
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property {string[]} [includedAttributes = []] The attributes to include in the refinements to clear (all by default). Cannot be used with `excludedAttributes`.
 * @property {string[]} [excludedAttributes = ['query']] The attributes to exclude from the refinements to clear. Cannot be used with `includedAttributes`.
 * @property {function(object[]):object[]} [transformItems] Function to transform the items passed to the templates.
 * @property {ClearRefinementsTemplates} [templates] Templates to use for the widget.
 * @property {ClearRefinementsCSSClasses} [cssClasses] CSS classes to be added.
 */

/**
 * The clear all widget gives the user the ability to clear all the refinements currently
 * applied on the results. It is equivalent to the reset button of a form.
 *
 * The current refined values widget can display a button that has the same behavior.
 * @type {WidgetFactory}
 * @devNovel ClearRefinements
 * @category clear-filter
 * @param {ClearRefinementsWidgetOptions} $0 The ClearRefinements widget options.
 * @returns {Widget} A new instance of the ClearRefinements widget.
 * @example
 * search.addWidgets([
 *   instantsearch.widgets.clearRefinements({
 *     container: '#clear-all',
 *     templates: {
 *       resetLabel: 'Reset everything'
 *     },
 *   })
 * ]);
 */
export default function clearRefinements({
  container,
  templates = defaultTemplates,
  includedAttributes,
  excludedAttributes,
  transformItems,
  cssClasses: userCssClasses = {},
}) {
  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    button: cx(suit({ descendantName: 'button' }), userCssClasses.button),
    disabledButton: cx(
      suit({ descendantName: 'button', modifierName: 'disabled' }),
      userCssClasses.disabledButton
    ),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    renderState: {},
    templates,
  });

  const makeWidget = connectClearRefinements(specializedRenderer, () =>
    render(null, containerNode)
  );

  return makeWidget({
    includedAttributes,
    excludedAttributes,
    transformItems,
  });
}
