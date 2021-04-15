/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import connectBreadcrumb, {
  BreadcrumbWidgetDescription,
  BreadcrumbConnectorParams,
} from '../../connectors/breadcrumb/connectBreadcrumb';
import defaultTemplates from './defaultTemplates';
import {
  getContainerNode,
  prepareTemplateProps,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import { WidgetFactory, Template } from '../../types';

const withUsage = createDocumentationMessageGenerator({ name: 'breadcrumb' });
const suit = component('Breadcrumb');

const renderer = ({ containerNode, cssClasses, renderState, templates }) => (
  { canRefine, createURL, instantSearchInstance, items, refine },
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
    <Breadcrumb
      canRefine={canRefine}
      cssClasses={cssClasses}
      createURL={createURL}
      items={items}
      refine={refine}
      templateProps={renderState.templateProps}
    />,
    containerNode
  );
};

export type BreadcrumbCSSClasses = {
  /**
   * CSS class to add to the root element of the widget.
   */
  root?: string | string[];

  /**
   * CSS class to add to the root element of the widget if there are no refinements.
   */
  noRefinementRoot?: string | string[];

  /**
   * CSS class to add to the list element.
   */
  list?: string | string[];

  /**
   * CSS class to add to the items of the list. The items contains the link and the separator.
   */
  item?: string | string[];

  /**
   * CSS class to add to the selected item in the list: the last one or the home if there are no refinements.
   */
  selectedItem?: string | string[];

  /**
   * CSS class to add to the separator.
   */
  separator?: string | string[];

  /**
   * CSS class to add to the links in the items.
   */
  link?: string | string[];
};

export type BreadcrumbTemplates = {
  /**
   * Label of the breadcrumb's first element.
   */
  home?: Template;

  /**
   * Symbol used to separate the elements of the breadcrumb.
   */
  separator?: Template;
};

export type BreadcrumbWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * Templates to use for the widget.
   */
  templates?: BreadcrumbTemplates;

  /**
   * CSS classes to add to the wrapping elements.
   */
  cssClasses?: BreadcrumbCSSClasses;
};

export type BreadcrumbWidget = WidgetFactory<
  BreadcrumbWidgetDescription & { $$widgetType: 'ais.breadcrumb' },
  BreadcrumbConnectorParams,
  BreadcrumbWidgetParams
>;

const breadcrumb: BreadcrumbWidget = function breadcrumb(widgetParams) {
  const {
    container,
    attributes,
    separator,
    rootPath,
    transformItems,
    templates = defaultTemplates,
    cssClasses: userCssClasses = {},
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    noRefinementRoot: cx(
      suit({ modifierName: 'noRefinement' }),
      userCssClasses.noRefinementRoot
    ),
    list: cx(suit({ descendantName: 'list' }), userCssClasses.list),
    item: cx(suit({ descendantName: 'item' }), userCssClasses.item),
    selectedItem: cx(
      suit({ descendantName: 'item', modifierName: 'selected' }),
      userCssClasses.selectedItem
    ),
    separator: cx(
      suit({ descendantName: 'separator' }),
      userCssClasses.separator
    ),
    link: cx(suit({ descendantName: 'link' }), userCssClasses.link),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    renderState: {},
    templates,
  });

  const makeWidget = connectBreadcrumb(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({ attributes, separator, rootPath, transformItems }),
    $$widgetType: 'ais.breadcrumb',
  };
};

export default breadcrumb;
