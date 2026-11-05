/** @jsx h */

import { createDocumentationMessageGenerator, find } from 'instantsearch-core';
import { suitComponent as component } from 'instantsearch-core';
import { cx } from 'instantsearch-ui-components';
import { h, render } from 'preact';

import Selector from '../../components/Selector/Selector';
import { connectHitsPerPage } from '../../connectors';
import { getContainerNode } from '../../lib/utils';

import type {
  HitsPerPageConnectorParams,
  HitsPerPageRenderState,
  HitsPerPageWidgetDescription,
} from '../../connectors';
import type { ComponentCSSClasses } from '../../types';
import type { WidgetFactory } from 'instantsearch-core';

const withUsage = createDocumentationMessageGenerator({
  name: 'hits-per-page',
});
const suit = component('HitsPerPage');

const renderer =
  ({
    containerNode,
    cssClasses,
  }: {
    containerNode: HTMLElement;
    cssClasses: ComponentCSSClasses<HitsPerPageCSSClasses>;
  }) =>
  ({ items, refine }: HitsPerPageRenderState, isFirstRendering: boolean) => {
    if (isFirstRendering) return;

    const { value: currentValue } =
      find(items, ({ isRefined }) => isRefined) || {};

    render(
      <div className={cssClasses.root}>
        <Selector
          cssClasses={cssClasses}
          currentValue={currentValue}
          options={items}
          // @ts-expect-error: the refine function expects a number, but setValue will call it with a string. We don't want to change the type of the refine function because it's part of the connector API.
          setValue={refine}
        />
      </div>,
      containerNode
    );
  };

export type HitsPerPageCSSClasses = Partial<{
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
}>;

export type HitsPerPageWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * CSS classes to be added.
   */
  cssClasses?: HitsPerPageCSSClasses;
};

export type HitsPerPageWidget = WidgetFactory<
  HitsPerPageWidgetDescription & { $$widgetType: 'ais.hitsPerPage' },
  HitsPerPageConnectorParams,
  HitsPerPageWidgetParams
>;

const hitsPerPage: HitsPerPageWidget = function hitsPerPage(widgetParams) {
  const {
    container,
    items,
    cssClasses: userCssClasses = {},
    transformItems,
  } = widgetParams || {};

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

  const makeWidget = connectHitsPerPage(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({ items, transformItems }),
    $$widgetType: 'ais.hitsPerPage',
  };
};

export default hitsPerPage;
