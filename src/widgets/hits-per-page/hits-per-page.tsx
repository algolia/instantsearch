/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import Selector from '../../components/Selector/Selector';
import connectHitsPerPage, {
  HitsPerPageConnectorParams,
  HitsPerPageRenderState,
  HitsPerPageWidgetDescription,
} from '../../connectors/hits-per-page/connectHitsPerPage';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
  find,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import { WidgetFactory } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'hits-per-page',
});
const suit = component('HitsPerPage');

const renderer = ({ containerNode, cssClasses }) => (
  { items, refine }: HitsPerPageRenderState,
  isFirstRendering: boolean
) => {
  if (isFirstRendering) return;

  const { value: currentValue } =
    find(items, ({ isRefined }) => isRefined) || {};

  render(
    <div className={cssClasses.root}>
      <Selector
        cssClasses={cssClasses}
        currentValue={currentValue}
        options={items}
        setValue={refine}
      />
    </div>,
    containerNode
  );
};

export type HitsPerPageCSSClasses = {
  /**
   * CSS classes added to the outer `<div>`.
   */
  root?: string | string[];

  /**
   * CSS classes added to the parent `<select>`.
   */
  select?: string | string[];

  /**
   * CSS classes added to each `<option>`.
   */
  option?: string | string[];
};

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

  const makeWidget = connectHitsPerPage(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({ items, transformItems }),
    $$widgetType: 'ais.hitsPerPage',
  };
};

export default hitsPerPage;
