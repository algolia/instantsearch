/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import {
  createDocumentationMessageGenerator,
  getContainerNode,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import { WidgetFactory, Template } from '../../types';
import defaultTemplates from './defaultTemplates';
import connectHistogram, {
  HistogramRenderer,
} from '../../connectors/histogram/connectHistogram';
import Histogram, {
  HistogramComponentCSSClasses,
} from '../../components/Histogram/Histogram';

const withUsage = createDocumentationMessageGenerator({ name: 'histogram' });
const suit = component('Histogram');

export type HistogramCSSClasses = {
  root: string | string[];
};

export type HistogramTemplates = {
  test: Template;
};

type HistogramWidgetParams = {
  container: string | HTMLElement;
  attribute: string;
  cssClasses?: Partial<HistogramCSSClasses>;
  templates?: Partial<HistogramTemplates>;
};

type Histogram = WidgetFactory<HistogramWidgetParams>;

interface HistogramRendererWidgetParams extends HistogramWidgetParams {
  container: HTMLElement;
  cssClasses: HistogramComponentCSSClasses;
  templates: HistogramTemplates;
}

const renderer: HistogramRenderer<HistogramRendererWidgetParams> = ({
  widgetParams,
  items,
}) => {
  const { container, cssClasses, templates } = widgetParams;

  render(
    <Histogram items={items} cssClasses={cssClasses} templates={templates} />,
    container
  );
};

const histogram: Histogram = (
  {
    container,
    attribute,
    cssClasses: userCssClasses = {} as HistogramCSSClasses,
    templates = {} as HistogramTemplates,
  } = {} as HistogramWidgetParams
) => {
  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
  };

  const makeWidget = connectHistogram(renderer, () =>
    render(null, containerNode)
  );

  return makeWidget({
    container: containerNode,
    attribute,
    templates: { ...defaultTemplates, ...templates },
    cssClasses,
  });
};

export default histogram;
