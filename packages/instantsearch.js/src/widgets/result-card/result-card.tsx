/** @jsx h */

import { createResultCardComponent } from 'instantsearch-ui-components';
import { h, render } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import TemplateComponent from '../../components/Template/Template';
import connectResultCard from '../../connectors/result-card/connectResultCard';
import { prepareTemplateProps } from '../../lib/templating';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import type {
  ResultCardRenderState,
  ResultCardConnectorParams,
  ResultCardWidgetDescription,
} from '../../connectors/result-card/connectResultCard';
import type { PreparedTemplateProps } from '../../lib/templating';
import type { WidgetFactory, Renderer, Template } from '../../types';
import type {
  ResultCardClassNames,
  ResultCardTranslations,
} from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({
  name: 'result-card',
});

const ResultCard = createResultCardComponent({
  createElement: h,
  Fragment: 'fragment',
  useState,
  useEffect,
});

export type ResultCardCSSClasses = Partial<ResultCardClassNames>;

/**
 * Data passed to a custom `templates.layout`: the connector render state, so
 * the template owns the full markup.
 */
export type ResultCardLayoutTemplateData = ResultCardRenderState;

export type ResultCardTemplates = {
  /**
   * Replaces the default card with custom markup. Receives the full render
   * state: the template is responsible for every status, including the
   * dismiss, retry, and handoff actions.
   */
  layout?: Template<ResultCardLayoutTemplateData>;
};

type ResultCardWidgetParams = {
  /** CSS Selector or HTMLElement to insert the widget. */
  container: string | HTMLElement;
  /** CSS classes to add. */
  cssClasses?: ResultCardCSSClasses;
  /** Custom templates. */
  templates?: ResultCardTemplates;
  /** Translations for the widget. */
  translations?: Partial<ResultCardTranslations>;
};

export type ResultCardWidget = WidgetFactory<
  ResultCardWidgetDescription & {
    $$widgetType: 'ais.resultCard';
  },
  ResultCardConnectorParams,
  ResultCardWidgetParams
>;

const createRenderer =
  ({
    containerNode,
    cssClasses,
    renderState,
    templates,
    translations,
  }: {
    containerNode: HTMLElement;
    cssClasses: ResultCardCSSClasses;
    renderState: {
      templateProps?: PreparedTemplateProps<ResultCardTemplates>;
    };
    templates?: ResultCardTemplates;
    translations?: Partial<ResultCardTranslations>;
  }): Renderer<ResultCardRenderState, Partial<ResultCardWidgetParams>> =>
  (
    {
      status,
      query,
      messages,
      error,
      suggestions,
      retry,
      dismiss,
      canContinueInChat,
      continueInChat,
      expanded,
      setExpanded,
      tools,
      indexUiState,
      setIndexUiState,
      sendEvent,
      instantSearchInstance,
    },
    isFirstRendering
  ) => {
    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps<ResultCardTemplates>({
        defaultTemplates: {},
        templatesConfig: instantSearchInstance.templatesConfig,
        templates,
      });
      return;
    }

    if (templates?.layout) {
      render(
        <TemplateComponent
          {...renderState.templateProps}
          templateKey="layout"
          rootTagName="fragment"
          data={{
            status,
            query,
            messages,
            error,
            suggestions,
            retry,
            dismiss,
            canContinueInChat,
            continueInChat,
            expanded,
            setExpanded,
            tools,
            indexUiState,
            setIndexUiState,
            sendEvent,
          }}
        />,
        containerNode
      );
      return;
    }

    render(
      <ResultCard
        classNames={cssClasses}
        translations={translations}
        status={status}
        messages={messages}
        error={error}
        suggestions={suggestions}
        tools={tools}
        indexUiState={indexUiState}
        setIndexUiState={setIndexUiState}
        onDismiss={dismiss}
        onRetry={retry}
        canContinueInChat={canContinueInChat}
        onContinueInChat={continueInChat}
        expanded={expanded}
        onExpandedChange={setExpanded}
      />,
      containerNode
    );
  };

export default (function resultCard(
  widgetParams: ResultCardWidgetParams & ResultCardConnectorParams
) {
  const {
    container,
    cssClasses = {},
    templates,
    translations,
    ...connectorParams
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const specializedRenderer = createRenderer({
    containerNode,
    cssClasses,
    renderState: {},
    templates,
    translations,
  });

  const makeWidget = connectResultCard(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget(connectorParams as ResultCardConnectorParams),
    $$widgetType: 'ais.resultCard',
  };
} satisfies ResultCardWidget);
