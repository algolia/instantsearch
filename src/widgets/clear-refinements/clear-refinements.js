import React, { render, unmountComponentAtNode } from 'preact-compat';
import ClearRefinements from '../../components/ClearRefinements/ClearRefinements.js';
import cx from 'classnames';
import connectClearRefinements from '../../connectors/clear-refinements/connectClearRefinements.js';
import defaultTemplates from './defaultTemplates.js';
import { getContainerNode, prepareTemplateProps } from '../../lib/utils.js';
import { component } from '../../lib/suit';

const suit = component('ClearRefinements');

const renderer = ({
  containerNode,
  cssClasses,
  collapsible,
  renderState,
  templates,
}) => ({ refine, hasRefinements, instantSearchInstance }, isFirstRendering) => {
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
      collapsible={collapsible}
      cssClasses={cssClasses}
      hasRefinements={hasRefinements}
      templateProps={renderState.templateProps}
    />,
    containerNode
  );
};

const usage = `Usage:
clearRefinements({
  container,
  [ cssClasses.{root,button,disabledButton} ],
  [ templates.{resetLabel}={resetLabel: 'Clear all refinements'} ],
  [ collapsible=false ],
  [ excludedAttributes=[] ]
})`;
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
 * @property {string[]} [excludedAttributes] List of attributes names to exclude from clear actions.
 * @property {ClearRefinementsTemplates} [templates] Templates to use for the widget.
 * @property {ClearRefinementsCSSClasses} [cssClasses] CSS classes to be added.
 * @property {boolean} [clearsQuery = false] If true, the widget will also clear the query.
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
 * search.addWidget(
 *   instantsearch.widgets.clearRefinements({
 *     container: '#clear-all',
 *     templates: {
 *       resetLabel: 'Reset everything'
 *     },
 *     clearsQuery: true,
 *   })
 * );
 */
export default function clearRefinements({
  container,
  templates = defaultTemplates,
  cssClasses: userCssClasses = {},
  collapsible = false,
  excludedAttributes = [],
  clearsQuery = false,
}) {
  if (!container) {
    throw new Error(usage);
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
    collapsible,
    renderState: {},
    templates,
  });

  try {
    const makeWidget = connectClearRefinements(specializedRenderer, () =>
      unmountComponentAtNode(containerNode)
    );
    return makeWidget({ excludedAttributes, clearsQuery });
  } catch (error) {
    throw new Error(usage);
  }
}
