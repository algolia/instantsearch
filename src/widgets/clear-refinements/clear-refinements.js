import React, { render, unmountComponentAtNode } from 'preact-compat';
import ClearRefinementsWithHOCs from '../../components/ClearRefinements/ClearRefinements.js';
import cx from 'classnames';

import { getContainerNode, prepareTemplateProps } from '../../lib/utils.js';

import { component } from '../../lib/suit.js';

import connectClearRefinements from '../../connectors/clear-refinements/connectClearRefinements.js';

import defaultTemplates from './defaultTemplates.js';

const suit = component('ais-clear-all');

const renderer = ({
  containerNode,
  cssClasses,
  collapsible,
  autoHideContainer,
  renderState,
  templates,
}) => (
  { refine, hasRefinements, createURL, instantSearchInstance },
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

  const shouldAutoHideContainer = autoHideContainer && !hasRefinements;

  render(
    <ClearRefinementsWithHOCs
      refine={refine}
      collapsible={collapsible}
      cssClasses={cssClasses}
      hasRefinements={hasRefinements}
      shouldAutoHideContainer={shouldAutoHideContainer}
      templateProps={renderState.templateProps}
      url={createURL()}
    />,
    containerNode
  );
};

const usage = `Usage:
clearRefinements({
  container,
  [ cssClasses.{root,header,body,footer,button}={} ],
  [ templates.{header,button,footer}={button: 'Clear all'} ],
  [ autoHideContainer=true ],
  [ collapsible=false ],
  [ excludedAttributes=[] ]
})`;
/**
 * @typedef {Object} ClearAllCSSClasses
 * @property {string|string[]} [root] CSS class to add to the root element.
 * @property {string|string[]} [header] CSS class to add to the header element.
 * @property {string|string[]} [body] CSS class to add to the body element.
 * @property {string|string[]} [footer] CSS class to add to the footer element.
 * @property {string|string[]} [button] CSS class to add to the button element.
 */

/**
 * @typedef {Object} ClearAllTemplates
 * @property {string|function(object):string} [header] Header template.
 * @property {string|function(object):string} [button] button content template.
 * @property {string|function(object):string} [footer] Footer template.
 */

/**
 * @typedef {Object} ClearAllWidgetOptions
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property {string[]} [excludedAttributes] List of attributes names to exclude from clear actions.
 * @property {ClearAllTemplates} [templates] Templates to use for the widget.
 * @property {boolean} [autoHideContainer=true] Hide the container when there are no refinements to clear.
 * @property {ClearAllCSSClasses} [cssClasses] CSS classes to be added.
 * @property {boolean|{collapsed: boolean}} [collapsible=false] Makes the widget collapsible. The user can then.
 * choose to hide the content of the widget. This option can also be an object with the property collapsed. If this
 * property is `true`, then the widget is hidden during the first rendering.
 * @property {boolean} [clearsQuery = false] If true, the widget will also clear the query.
 */

/**
 * The clear all widget gives the user the ability to clear all the refinements currently
 * applied on the results. It is equivalent to the reset button of a form.
 *
 * The current refined values widget can display a button that has the same behavior.
 * @type {WidgetFactory}
 * @devNovel clearRefinements
 * @category clear-filter
 * @param {ClearAllWidgetOptions} $0 The clearRefinements widget options.
 * @returns {Widget} A new instance of the clearRefinements widget.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.clearRefinements({
 *     container: '#clear-all',
 *     templates: {
 *       content: 'Reset everything'
 *     },
 *     autoHideContainer: false,
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
      suit({ descendantName: 'button' }),
      suit({ descendantName: 'button', modifierName: 'disabled' }),
      userCssClasses.button
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
