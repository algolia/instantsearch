/** @jsx h */

import { createDocumentationMessageGenerator } from 'instantsearch-core';
import { createHitsPerPageComponent } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

import { connectHitsPerPage } from '../../connectors';
import { getContainerNode } from '../../lib/utils';

import type {
  HitsPerPageConnectorParams,
  HitsPerPageRenderState,
  HitsPerPageWidgetDescription,
} from '../../connectors';
import type { WidgetFactory } from 'instantsearch-core';

const withUsage = createDocumentationMessageGenerator({
  name: 'hits-per-page',
});

const HitsPerPage = createHitsPerPageComponent({ createElement: h, Fragment });

const renderer =
  ({
    containerNode,
    classNames,
  }: {
    containerNode: HTMLElement;
    classNames: HitsPerPageCSSClasses;
  }) =>
  ({ items, refine }: HitsPerPageRenderState, isFirstRendering: boolean) => {
    if (isFirstRendering) return;

    const { value: currentValue } =
      items.find(({ isRefined }) => isRefined) || {};

    render(
      <HitsPerPage
        items={items}
        currentValue={currentValue}
        onChange={refine}
        classNames={classNames}
      />,
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

  const classNames: HitsPerPageCSSClasses = {
    root: userCssClasses.root,
    select: userCssClasses.select,
    option: userCssClasses.option,
  };

  const specializedRenderer = renderer({
    containerNode,
    classNames,
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
