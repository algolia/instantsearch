/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import Selector from '../../components/Selector/Selector';
import connectSortBy, {
  SortByConnectorParams,
  SortByItem,
  SortByRenderState,
  SortByWidgetDescription,
} from '../../connectors/sort-by/connectSortBy';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import { Renderer, TransformItems, WidgetFactory } from '../../types';

const withUsage = createDocumentationMessageGenerator({ name: 'sort-by' });
const suit = component('SortBy');

export type SortByWidgetCssClasses = {
  /**
   * CSS classes added to the outer `<div>`.
   */
  root: string | string[];
  /**
   * CSS classes added to the parent `<select>`.
   */
  select: string | string[];
  /**
   * CSS classes added to each `<option>`.
   */
  option: string | string[];
};

export type SortByIndexDefinition = {
  /**
   * The name of the index to target.
   */
  value: string;
  /**
   * The label of the index to display.
   */
  label: string;
};

export type SortByWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;
  /**
   * Array of objects defining the different indices to choose from.
   */
  items: SortByIndexDefinition[];
  /**
   * CSS classes to be added.
   */
  cssClasses?: Partial<SortByWidgetCssClasses>;
  /**
   * Function to transform the items passed to the templates.
   */
  transformItems?: TransformItems<SortByItem>;
};

export type SortByWidget = WidgetFactory<
  SortByWidgetDescription & { $$widgetType: 'ais.sortBy' },
  SortByConnectorParams,
  SortByWidgetParams
>;

const renderer = ({
  containerNode,
  cssClasses,
}): Renderer<SortByRenderState, SortByWidgetParams> => (
  { currentRefinement, options, refine },
  isFirstRendering
) => {
  if (isFirstRendering) {
    return;
  }

  render(
    <div className={cssClasses.root}>
      <Selector
        cssClasses={cssClasses}
        currentValue={currentRefinement}
        options={options}
        setValue={refine}
      />
    </div>,
    containerNode
  );
};

/**
 * Sort by selector is a widget used for letting the user choose between different
 * indices that contains the same data with a different order / ranking formula.
 */
const sortBy: SortByWidget = widgetParams => {
  const { container, items, cssClasses: userCssClasses = {}, transformItems } =
    widgetParams || {};
  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    select: cx(suit({ descendantName: 'select' }), userCssClasses.select),
    option: cx(suit({ descendantName: 'option' }), userCssClasses.option),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
  });

  const makeWidget = connectSortBy(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({ container: containerNode, items, transformItems }),
    $$widgetType: 'ais.sortBy',
  };
};

export default sortBy;
