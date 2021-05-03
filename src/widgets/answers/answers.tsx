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
  AnswersRenderState,
  AnswersConnectorParams,
  AnswersWidgetDescription,
} from '../../connectors/answers/connectAnswers';

const withUsage = createDocumentationMessageGenerator({ name: 'answers' });
const suit = component('Answers');

const renderer = ({
  renderState,
  cssClasses,
  containerNode,
  templates,
}): Renderer<AnswersRenderState, Partial<AnswersWidgetParams>> => (
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
  /**
   * Template to use for the header. This template will receive an object containing `hits` and `isLoading`.
   */
  header: Template<{
    hits: Hit[];
    isLoading: boolean;
  }>;

  /**
   * Template to use for the loader.
   */
  loader: Template;

  /**
   * Template to use for each result. This template will receive an object containing a single record.
   */
  item: Template<Hit>;
};

export type AnswersCSSClasses = {
  /**
   * CSS class to add to the root element of the widget.
   */
  root: string | string[];

  /**
   * CSS class to add to the wrapping element when no results.
   */
  emptyRoot: string | string[];

  /**
   * CSS classes to add to the header.
   */
  header: string | string[];

  /**
   * CSS classes to add to the loader.
   */
  loader: string | string[];

  /**
   * CSS class to add to the list of results.
   */
  list: string | string[];

  /**
   * CSS class to add to each result.
   */
  item: string | string[];
};

export type AnswersWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * The templates to use for the widget.
   */
  templates?: Partial<AnswersTemplates>;

  /**
   * The CSS classes to override.
   */
  cssClasses?: Partial<AnswersCSSClasses>;
};

export type AnswersWidget = WidgetFactory<
  AnswersWidgetDescription & { $$widgetType: 'ais.answers' },
  AnswersConnectorParams,
  AnswersWidgetParams
>;

const answersWidget: AnswersWidget = widgetParams => {
  const {
    container,
    attributesForPrediction,
    queryLanguages,
    nbHits,
    searchDebounceTime,
    renderDebounceTime,
    escapeHTML,
    extraParameters,
    templates = defaultTemplates,
    cssClasses: userCssClasses = {},
  } = widgetParams || {};

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

  return {
    ...makeWidget({
      attributesForPrediction,
      queryLanguages,
      nbHits,
      searchDebounceTime,
      renderDebounceTime,
      escapeHTML,
      extraParameters,
    }),
    $$widgetType: 'ais.answers',
  };
};

export default answersWidget;
