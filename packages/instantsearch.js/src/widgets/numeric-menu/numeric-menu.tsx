/** @jsx h */

import { connectNumericMenu } from 'instantsearch-core';
import { createDocumentationMessageGenerator } from 'instantsearch-core/internal';
import { suitComponent as component } from 'instantsearch-core/internal';
import { createNumericMenuComponent, cx } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

import TemplateComponent from '../../components/Template/Template';
import { prepareTemplateProps } from '../../lib/templating';
import { getContainerNode, shouldRefineFromItemClick } from '../../lib/utils';

import type { PreparedTemplateProps } from '../../lib/templating';
import type { ComponentCSSClasses, Template } from '../../types';
import type {
  NumericMenuConnectorParams,
  NumericMenuRenderState,
  NumericMenuWidgetDescription,
} from 'instantsearch-core';
import type { Renderer, WidgetFactory } from 'instantsearch-core';
import type { NumericMenuItemComponentProps } from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({ name: 'numeric-menu' });
const suit = component('NumericMenu');

const NumericMenuUiComponent = createNumericMenuComponent({
  createElement: h,
  Fragment,
});

const renderer = ({
  containerNode,
  attribute,
  cssClasses,
  userCssClasses,
  renderState,
  templates,
}: {
  containerNode: HTMLElement;
  attribute: string;
  cssClasses: NumericMenuComponentCSSClasses;
  userCssClasses: NumericMenuCSSClasses;
  renderState: {
    templateProps?: PreparedTemplateProps<NumericMenuTemplates>;
  };
  templates: NumericMenuTemplates;
}): Renderer<NumericMenuRenderState, Partial<NumericMenuWidgetParams>> => {
  let lastRefinedValue: string | undefined = undefined;

  // Latest render values, read by the item component so that it keeps the
  // same identity across renders (a new one would remount every item).
  let current: Pick<NumericMenuRenderState, 'refine' | 'createURL'>;

  const itemComponent = ({
    item,
    className,
    children,
  }: NumericMenuItemComponentProps) => (
    <li
      className={className}
      onClick={(originalEvent) => {
        if (shouldRefineFromItemClick(originalEvent, item.isRefined)) {
          lastRefinedValue = item.value;
          current.refine(item.value);
        }
      }}
    >
      {templates.item !== undefined ? (
        <TemplateComponent
          {...renderState.templateProps!}
          templateKey="item"
          rootTagName="fragment"
          data={{
            ...item,
            attribute,
            url: current.createURL(item.value),
            cssClasses,
          }}
        />
      ) : (
        children
      )}
    </li>
  );

  return (
    { createURL, refine, items, canRefine },
    isFirstRendering: boolean
  ) => {
    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps<NumericMenuTemplates>({
        defaultTemplates: {},
        templates,
      });
      return;
    }

    current = { refine, createURL };

    render(
      <NumericMenuUiComponent
        items={items}
        canRefine={canRefine}
        attribute={attribute}
        itemComponent={itemComponent}
        classNames={userCssClasses}
      />,
      containerNode
    );

    // Preact doesn't keep the focus on the radio button that was clicked
    // when it re-renders (https://github.com/preactjs/preact/issues/3242).
    if (lastRefinedValue !== undefined) {
      const inputs = containerNode.getElementsByTagName('input');
      for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].value === lastRefinedValue) {
          inputs[i].focus();
          break;
        }
      }
      lastRefinedValue = undefined;
    }
  };
};

export type NumericMenuCSSClasses = Partial<{
  /**
   * CSS class to add to the root element.
   */
  root: string | string[];

  /**
   * CSS class to add to the root element when no refinements.
   */
  noRefinementRoot: string | string[];

  /**
   * CSS class to add to the list element.
   */
  list: string | string[];

  /**
   * CSS class to add to each item element.
   */
  item: string | string[];

  /**
   * CSS class to add to each selected item element.
   */
  selectedItem: string | string[];

  /**
   * CSS class to add to each label element.
   */
  label: string | string[];

  /**
   * CSS class to add to each label text element.
   */
  labelText: string | string[];

  /**
   * CSS class to add to each radio element (when using the default template).
   */
  radio: string | string[];
}>;

export type NumericMenuComponentCSSClasses =
  ComponentCSSClasses<NumericMenuCSSClasses>;

export type NumericMenuTemplates = Partial<{
  /**
   * Item template, provided with `label` (the name in the configuration), `isRefined`, `url`, `value` (the setting for the filter) data properties.
   */
  item: Template<{
    /**
     * The name of the attribute.
     */
    attribute: string;

    /**
     * The label for the option.
     */
    label: string;

    /**
     * The encoded URL of the bounds object with a {start, end} form. This
     * value can be used verbatim in the webpage and can be read by refine
     * directly. If you want to inspect the value, you can do JSON.parse(window.decodeURI(value))
     * to get the object.
     */
    value: string;

    /**
     *  Whether or not the refinement is selected.
     */
    isRefined: boolean;

    /**
     * The URL with the applied refinement.
     */
    url: string;

    /**
     * The CSS classes provided to the widget.
     */
    cssClasses: NumericMenuComponentCSSClasses;
  }>;
}>;

export type NumericMenuComponentTemplates = Required<NumericMenuTemplates>;

export type NumericMenuWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * Templates to use for the widget.
   */
  templates?: NumericMenuTemplates;

  /**
   * CSS classes to add to the wrapping elements.
   */
  cssClasses?: NumericMenuCSSClasses;
};

export type NumericMenuWidget = WidgetFactory<
  NumericMenuWidgetDescription & { $$widgetType: 'ais.numericMenu' },
  NumericMenuConnectorParams,
  NumericMenuWidgetParams
>;

const numericMenu: NumericMenuWidget = function numericMenu(widgetParams) {
  const {
    container,
    attribute,
    items,
    cssClasses: userCssClasses = {},
    templates = {},
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
    list: cx(suit({ descendantName: 'list' }), userCssClasses.list),
    item: cx(suit({ descendantName: 'item' }), userCssClasses.item),
    selectedItem: cx(
      suit({ descendantName: 'item', modifierName: 'selected' }),
      userCssClasses.selectedItem
    ),
    label: cx(suit({ descendantName: 'label' }), userCssClasses.label),
    radio: cx(suit({ descendantName: 'radio' }), userCssClasses.radio),
    labelText: cx(
      suit({ descendantName: 'labelText' }),
      userCssClasses.labelText
    ),
  };

  const specializedRenderer = renderer({
    containerNode,
    attribute,
    cssClasses,
    userCssClasses,
    renderState: {},
    templates,
  });

  const makeWidget = connectNumericMenu(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({
      attribute,
      items,
      transformItems,
    }),
    $$widgetType: 'ais.numericMenu',
  };
};

export default numericMenu;
