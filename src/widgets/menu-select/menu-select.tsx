/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import connectMenu, {
  MenuConnectorParams,
  MenuRenderState,
  MenuWidgetDescription,
} from '../../connectors/menu/connectMenu';
import MenuSelect from '../../components/MenuSelect/MenuSelect';
import defaultTemplates from './defaultTemplates';
import {
  prepareTemplateProps,
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import { RendererOptions, Template, WidgetFactory } from '../../types';
import { PreparedTemplateProps } from '../../lib/utils/prepareTemplateProps';

const withUsage = createDocumentationMessageGenerator({ name: 'menu-select' });
const suit = component('MenuSelect');

export type MenuSelectCSSClasses = {
  /**
   * CSS class to add to the root element.
   */
  root: string;
  /**
   * CSS class to add to the root when there are no items to display
   */
  noRefinementRoot: string;
  /**
   * CSS class to add to the select element.
   */
  select: string;
  /**
   * CSS class to add to the option element.
   */
  option: string;
};

export type MenuSelectTemplates = {
  /**
   * Item template, provided with `label`, `count`, `isRefined` and `value` data properties.
   */
  item: Template<{
    label: string;
    value: string;
    count: number;
    isRefined: boolean;
  }>;
  /**
   * Label of the "see all" option in the select.
   */
  defaultOption: Template;
};

export type MenuSelectWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;
  /**
   * Customize the output through templating.
   */
  templates?: Partial<MenuSelectTemplates>;
  /**
   * CSS classes to add to the wrapping elements.
   */
  cssClasses?: Partial<MenuSelectCSSClasses>;
};

const renderer = ({
  containerNode,
  cssClasses,
  renderState,
  templates,
}: {
  containerNode: HTMLElement;
  cssClasses: MenuSelectCSSClasses;
  renderState: { templateProps?: PreparedTemplateProps<MenuSelectTemplates> };
  templates: Partial<MenuSelectTemplates>;
}) => (
  {
    refine,
    items,
    instantSearchInstance,
  }: MenuRenderState & RendererOptions<MenuConnectorParams>,
  isFirstRendering: boolean
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
    <MenuSelect
      cssClasses={cssClasses}
      items={items}
      refine={refine}
      templateProps={renderState.templateProps!}
    />,
    containerNode
  );
};

export type MenuSelectWidget = WidgetFactory<
  MenuWidgetDescription & { $$widgetType: 'ais.menuSelect' },
  MenuConnectorParams,
  MenuSelectWidgetParams
>;

const menuSelect: MenuSelectWidget = function menuSelect(widgetParams) {
  const {
    container,
    attribute,
    sortBy = ['name:asc'],
    limit = 10,
    cssClasses: userCssClasses = {},
    templates = defaultTemplates,
    transformItems,
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
    select: cx(suit({ descendantName: 'select' }), userCssClasses.select),
    option: cx(suit({ descendantName: 'option' }), userCssClasses.option),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    renderState: {},
    templates,
  });

  const makeWidget = connectMenu(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({ attribute, limit, sortBy, transformItems }),
    $$widgetType: 'ais.menuSelect',
  };
};

export default menuSelect;
