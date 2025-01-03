/** @jsx h */

import { cx } from 'instantsearch-ui-components';
import { h, render } from 'preact';

import Slider from '../../components/Slider/Slider';
import { connectRange } from '../../connectors';
import { component } from '../../lib/suit';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import type { RangeSliderComponentCSSClasses } from '../../components/Slider/Slider';
import type {
  Range,
  RangeConnectorParams,
  RangeRenderState,
  RangeWidgetDescription,
} from '../../connectors';
import type { Renderer, WidgetFactory } from '../../types';

const withUsage = createDocumentationMessageGenerator({ name: 'range-slider' });
const suit = component('RangeSlider');

const renderer =
  ({
    containerNode,
    cssClasses,
    pips,
    step,
    tooltips,
  }: {
    containerNode: HTMLElement;
    cssClasses: RangeSliderComponentCSSClasses;
    pips: boolean;
    step?: number;
    tooltips: RangeSliderWidgetParams['tooltips'];
  }): Renderer<RangeRenderState, Partial<RangeSliderWidgetParams>> =>
  ({ refine, range, currentRefinement }, isFirstRendering) => {
    if (isFirstRendering) {
      // There's no information at this point, let's render nothing.
      return;
    }

    const { min: minRange, max: maxRange } = range;
    const { min: minValue, max: maxValue } = currentRefinement;

    // Clamp values to the range to avoid extra rendering & refinement.
    const values: Range = {
      min:
        typeof minValue === 'number' && minValue !== minRange
          ? Math.min(minValue, maxRange!)
          : minRange,
      max:
        typeof maxValue === 'number' && maxValue !== maxRange
          ? Math.max(maxValue, minRange!)
          : maxRange,
    };

    render(
      <Slider
        cssClasses={cssClasses}
        refine={refine}
        min={minRange}
        max={maxRange}
        values={values}
        tooltips={tooltips}
        step={step}
        pips={pips}
      />,
      containerNode
    );
  };

export type RangeSliderCssClasses = Partial<{
  /**
   * CSS class to add to the root element.
   */
  root: string | string[];
  /**
   * CSS class to add to the disabled root element.
   */
  disabledRoot: string | string[];
}>;

type RangeSliderTooltipOptions = {
  /**
   * The function takes the raw value as input, and should return
   * a string for the label that should be used for this value.
   * @example
   * { format(rawValue) {return '$' + Math.round(rawValue).toLocaleString() } }
   */
  format: (value: number) => string;
};

export type RangeSliderWidgetParams = {
  /**
   * CSS Selector or DOMElement to insert the widget.
   */
  container: string | HTMLElement;
  /**
   * Name of the attribute for faceting.;
   */
  attribute: string;
  /**
   * Should we show tooltips or not.
   * The default tooltip will show the raw value.
   * You can also provide an object with a format function as an attribute.
   * So that you can format the tooltip display value as you want.
   * @default true
   */
  tooltips?: boolean | RangeSliderTooltipOptions;
  /**
   * CSS classes to add to the wrapping elements.
   */
  cssClasses?: RangeSliderCssClasses;
  /**
   * Show slider pips.
   * @default true
   */
  pips?: boolean;
  /**
   * Number of digits after decimal point to use.
   * @default 0
   */
  precision?: number;
  /**
   * Every handle move will jump that number of steps.
   */
  step?: number;
  /**
   * Minimal slider value, default to automatically computed from the result set.
   */
  min?: number;
  /**
   * Maximal slider value, defaults to automatically computed from the result set.
   */
  max?: number;
};

export type RangeSliderWidget = WidgetFactory<
  Omit<RangeWidgetDescription, '$$type'> & {
    $$widgetType: 'ais.rangeSlider';
    $$type: 'ais.rangeSlider';
  },
  RangeConnectorParams,
  RangeSliderWidgetParams
>;

/**
 * The range slider is a widget which provides a user-friendly way to filter the
 * results based on a single numeric range.
 *
 * @requirements
 * The attribute passed to `attribute` must be declared as an
 * [attribute for faceting](https://www.algolia.com/doc/guides/searching/faceting/#declaring-attributes-for-faceting)
 * in your Algolia settings.
 *
 * The values inside this attribute must be JavaScript numbers (not strings).
 */
const rangeSlider: RangeSliderWidget = function rangeSlider(widgetParams) {
  const {
    container,
    attribute,
    min,
    max,
    cssClasses: userCssClasses = {},
    step,
    pips = true,
    precision = 0,
    tooltips = true,
  } = widgetParams || {};
  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);
  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    disabledRoot: cx(
      suit({ modifierName: 'disabled' }),
      userCssClasses.disabledRoot
    ),
  };

  const specializedRenderer = renderer({
    containerNode,
    step,
    pips,
    tooltips,
    cssClasses,
  });

  const makeWidget = connectRange(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({ attribute, min, max, precision }),

    $$type: 'ais.rangeSlider',
    $$widgetType: 'ais.rangeSlider',
  };
};

export default rangeSlider;
