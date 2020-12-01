/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import { WidgetFactory, Template, Hit, Renderer } from '../../types';
import defaultTemplates from './defaultTemplates';
import {
  createDocumentationMessageGenerator,
  getContainerNode,
  prepareTemplateProps,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import Answers from '../../components/Answers/Answers';
import connectAnswers, {
  AnswersRendererOptions,
  AnswersConnectorParams,
} from '../../connectors/answers/connectAnswers';

const withUsage = createDocumentationMessageGenerator({ name: 'answers' });
const suit = component('Answers');

const renderer = ({
  renderState,
  cssClasses,
  containerNode,
  templates,
}): Renderer<AnswersRendererOptions, Partial<AnswersWidgetParams>> => (
  { hits, isLoading, instantSearchInstance },
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
    <Answers
      cssClasses={cssClasses}
      hits={hits}
      isLoading={isLoading}
      templateProps={renderState.templateProps}
    />,
    containerNode
  );
};

export type AnswersTemplates = {
  header?: Template<{
    hits: Hit[];
    isLoading: boolean;
  }>;

  loader?: Template;

  item?: Template<Hit>;
};

export type AnswersCSSClasses = {
  root?: string | string[];

  emptyRoot?: string | string[];

  header?: string | string[];

  loader?: string | string[];

  list?: string | string[];

  item?: string | string[];
};

export type AnswersWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  attributesForPrediction: string[];

  queryLanguages?: string[];

  nbHits?: number;

  templates?: AnswersTemplates;

  cssClasses?: AnswersCSSClasses;
};

export type AnswersWidget = WidgetFactory<
  AnswersRendererOptions,
  AnswersConnectorParams,
  AnswersWidgetParams
>;

const answersWidget: AnswersWidget = widgetParams => {
  const {
    container,
    attributesForPrediction,
    queryLanguages = ['en'],
    nbHits = 1,
    templates = defaultTemplates,
    cssClasses: userCssClasses = {},
  } = widgetParams || ({} as typeof widgetParams);

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);
  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    emptyRoot: cx(suit({ modifierName: 'empty' }), userCssClasses.emptyRoot),
    header: cx(suit({ descendantName: 'header' }), userCssClasses.header),
    loader: cx(suit({ descendantName: 'loader' }), userCssClasses.loader),
    list: cx(suit({ descendantName: 'list' }), userCssClasses.list),
    item: cx(suit({ descendantName: 'item' }), userCssClasses.item),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    templates,
    renderState: {},
  });

  const makeWidget = connectAnswers(specializedRenderer, () =>
    render(null, containerNode)
  );

  return makeWidget({
    attributesForPrediction,
    queryLanguages,
    nbHits,
  });
};

export default answersWidget;
