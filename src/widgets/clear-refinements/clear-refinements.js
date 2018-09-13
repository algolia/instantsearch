import React, { render, unmountComponentAtNode } from 'preact-compat';
import ClearAll from '../../components/ClearRefinements/ClearRefinements.js';
import cx from 'classnames';

import { getContainerNode, prepareTemplateProps } from '../../lib/utils.js';

import { component } from '../../lib/suit';

import connectClearRefinements from '../../connectors/clear-refinements/connectClearRefinements.js';

import defaultTemplates from './defaultTemplates.js';

const suit = component('ClearRefinements');

const renderer = ({
  containerNode,
  cssClasses,
  collapsible,
  autoHideContainer,
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

  const shouldAutoHideContainer = autoHideContainer && !hasRefinements;

  render(
    <ClearAll
      refine={refine}
      collapsible={collapsible}
      cssClasses={cssClasses}
      hasRefinements={hasRefinements}
      shouldAutoHideContainer={shouldAutoHideContainer}
      templateProps={renderState.templateProps}
    />,
    containerNode
  );
};

const usage = `Usage:
clearRefinements({
  container,
  [ cssClasses.{root,button,disabledButton}={} ],
  [ templates.{resetLabel}={resetLabel: 'Clear all refinements'} ],
  [ autoHideContainer=true ],
  [ collapsible=false ],
  [ excludedAttributes=[] ]
})`;
/**
 * @typedef {Object} ClearAllCSSClasses
 * @property {string|string[]} [root] CSS class to add to the wrapper element.
 * @property {string|string[]} [button] CSS class to add to the button of the widget.
 * @property {string|string[]} [disabledButton] CSS class to add to the button when there are no refinements.
 */

/**
 * @typedef {Object} ClearAllTemplates
 * @property {string|string[]} [resetLabel] Template for the content of the button
 */

/**
 * @typedef {Object} ClearAllWidgetOptions
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property {string[]} [excludedAttributes] List of attributes names to exclude from clear actions.
 * @property {ClearAllTemplates} [templates] Templates to use for the widget.
 * @property {ClearAllCSSClasses} [cssClasses] CSS classes to be added.
 * @property {boolean} [clearsQuery = false] If true, the widget will also clear the query.
 */

/**
 * The clear all widget gives the user the ability to clear all the refinements currently
 * applied on the results. It is equivalent to the reset button of a form.
 *
 * The current refined values widget can display a button that has the same behavior.
 * @type {WidgetFactory}
 * @devNovel ClearAll
 * @category clear-filter
 * @param {ClearAllWidgetOptions} $0 The ClearAll widget options.
 * @returns {Widget} A new instance of the ClearAll widget.
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
  autoHideContainer = true,
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
    autoHideContainer,
    renderState: {},
    templates,
  });

  try {
    const makeWidget = connectClearRefinements(specializedRenderer, () =>
      unmountComponentAtNode(containerNode)
    );
    return makeWidget({ excludedAttributes, clearsQuery });
  } catch (e) {
    throw new Error(usage);
  }
}
