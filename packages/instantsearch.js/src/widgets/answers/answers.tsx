/** @jsx h */

import { cx } from '@algolia/ui-components-shared';
import { h, render } from 'preact';

import Answers from '../../components/Answers/Answers';
import connectAnswers from '../../connectors/answers/connectAnswers';
import { component } from '../../lib/suit';
import { prepareTemplateProps } from '../../lib/templating';
import {
  createDocumentationMessageGenerator,
  deprecate,
  getContainerNode,
} from '../../lib/utils';

import defaultTemplates from './defaultTemplates';

import type {
  AnswersComponentCSSClasses,
  AnswersComponentTemplates,
} from '../../components/Answers/Answers';
import type {
  AnswersRenderState,
  AnswersConnectorParams,
  AnswersWidgetDescription,
} from '../../connectors/answers/connectAnswers';
import type { PreparedTemplateProps } from '../../lib/templating';
import type { WidgetFactory, Template, Hit, Renderer } from '../../types';

const withUsage = createDocumentationMessageGenerator({ name: 'answers' });
const suit = component('Answers');

const renderer =
  ({
    containerNode,
    cssClasses,
    renderState,
    templates,
  }: {
    containerNode: HTMLElement;
    cssClasses: AnswersComponentCSSClasses;
    renderState: {
      templateProps?: PreparedTemplateProps<AnswersComponentTemplates>;
    };
    templates: AnswersTemplates;
  }): Renderer<AnswersRenderState, Partial<AnswersWidgetParams>> =>
  ({ hits, isLoading, instantSearchInstance }, isFirstRendering) => {
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
        templateProps={renderState.templateProps!}
      />,
      containerNode
    );
  };

export type AnswersTemplates = Partial<{
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
}>;

export type AnswersCSSClasses = Partial<{
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
}>;

export type AnswersWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * The templates to use for the widget.
   */
  templates?: AnswersTemplates;

  /**
   * The CSS classes to override.
   */
  cssClasses?: AnswersCSSClasses;
};

export type AnswersWidget = WidgetFactory<
  AnswersWidgetDescription & { $$widgetType: 'ais.answers' },
  AnswersConnectorParams,
  AnswersWidgetParams
>;

/**
 * @deprecated the answers service is no longer offered, and this widget will be removed in InstantSearch.js v5
 */
const answersWidget: AnswersWidget = (widgetParams) => {
  const {
    container,
    attributesForPrediction,
    queryLanguages,
    nbHits,
    searchDebounceTime,
    renderDebounceTime,
    escapeHTML,
    extraParameters,
    templates = {},
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

export default deprecate(
  answersWidget,
  'The answers widget is deprecated and will be removed in InstantSearch.js 5.0'
);
