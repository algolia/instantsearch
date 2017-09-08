import React from 'react';
import ReactDOM from 'react-dom';
import ClearAllWithHOCs from '../../components/ClearAll/ClearAll.js';
import cx from 'classnames';

import {
  bemHelper,
  getContainerNode,
  prepareTemplateProps,
} from '../../lib/utils.js';

import connectClearAll from '../../connectors/clear-all/connectClearAll.js';

import defaultTemplates from './defaultTemplates.js';

const bem = bemHelper('ais-clear-all');

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

  ReactDOM.render(
    <ClearAllWithHOCs
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
clearAll({
  container,
  [ cssClasses.{root,header,body,footer,link}={} ],
  [ templates.{header,link,footer}={link: 'Clear all'} ],
  [ autoHideContainer=true ],
  [ collapsible=false ],
  [ excludeAttributes=[] ]
})`;
/**
 * @typedef {Object} ClearAllCSSClasses
 * @property {string|string[]} [root] CSS class to add to the root element.
 * @property {string|string[]} [header] CSS class to add to the header element.
 * @property {string|string[]} [body] CSS class to add to the body element.
 * @property {string|string[]} [footer] CSS class to add to the footer element.
 * @property {string|string[]} [link] CSS class to add to the link element.
 */

/**
 * @typedef {Object} ClearAllTemplates
 * @property {string|function(object):string} [header] Header template.
 * @property {string|function(object):string} [link] Link template.
 * @property {string|function(object):string} [footer] Footer template.
 */

/**
 * @typedef {Object} ClearAllWidgetOptions
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property {string[]} [excludeAttributes] List of attributes names to exclude from clear actions.
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
 * @category clear-filter
 * @param {ClearAllWidgetOptions} $0 The ClearAll widget options.
 * @returns {Widget} A new instance of the ClearAll widget.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.clearAll({
 *     container: '#clear-all',
 *     templates: {
 *       link: 'Reset everything'
 *     },
 *     autoHideContainer: false,
 *     clearsQuery: true,
 *   })
 * );
 */
export default function clearAll({
  container,
  templates = defaultTemplates,
  cssClasses: userCssClasses = {},
  collapsible = false,
  autoHideContainer = true,
  excludeAttributes = [],
  clearsQuery = false,
}) {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    header: cx(bem('header'), userCssClasses.header),
    body: cx(bem('body'), userCssClasses.body),
    footer: cx(bem('footer'), userCssClasses.footer),
    link: cx(bem('link'), userCssClasses.link),
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
    const makeWidget = connectClearAll(specializedRenderer);
    return makeWidget({ excludeAttributes, clearsQuery });
  } catch (e) {
    throw new Error(usage);
  }
}
