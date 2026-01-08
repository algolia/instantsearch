/** @jsx h */

import { createPromptSuggestionsComponent } from 'instantsearch-ui-components';
import { h, render, Fragment } from 'preact';

import TemplateComponent from '../../components/Template/Template';
import connectPromptSuggestions from '../../connectors/prompt-suggestions/connectPromptSuggestions';
import { prepareTemplateProps } from '../../lib/templating';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import type { ChatTransport } from '../../connectors/chat/connectChat';
import type {
  PromptSuggestionsConnectorParams,
  PromptSuggestionsWidgetDescription,
} from '../../connectors/prompt-suggestions/connectPromptSuggestions';
import type { PreparedTemplateProps } from '../../lib/templating';
import type { Template, WidgetFactory } from '../../types';
import type { PromptSuggestionsClassNames } from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({
  name: 'prompt-suggestions',
});

const PromptSuggestions = createPromptSuggestionsComponent({
  createElement: h,
  Fragment,
});

export type PromptSuggestionsCSSClasses = Partial<PromptSuggestionsClassNames>;

export type PromptSuggestionsTemplates = Partial<{
  /**
   * Text to display as the title.
   */
  title: string;
  /**
   * Template to use for the title icon.
   */
  titleIcon: Template;
}>;

export type PromptSuggestionsWidgetParams = ChatTransport & {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;
  /**
   * Context object to send to the agent (e.g., product data for a PDP).
   */
  context: Record<string, unknown>;
  /**
   * Templates to use for the widget.
   */
  templates?: PromptSuggestionsTemplates;
  /**
   * CSS classes to add.
   */
  cssClasses?: PromptSuggestionsCSSClasses;
};

export type PromptSuggestionsWidget = WidgetFactory<
  PromptSuggestionsWidgetDescription & {
    $$widgetType: 'ais.promptSuggestions';
  },
  PromptSuggestionsConnectorParams,
  PromptSuggestionsWidgetParams
>;

const defaultTemplates: Required<PromptSuggestionsTemplates> = {
  title: 'Ask a question about this product:',
  titleIcon: '',
};

/**
 * The `promptSuggestions` widget displays prompt suggestions from the Algolia Agent API
 * based on page context (e.g., product data on a PDP). Clicking a suggestion opens the
 * chat and sends the suggestion as a message.
 */
export default (function promptSuggestions(
  widgetParams: PromptSuggestionsWidgetParams
) {
  const {
    container,
    agentId,
    transport,
    context,
    cssClasses: userCssClasses = {},
    templates = {},
    ...rest
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const cssClasses: PromptSuggestionsCSSClasses = {
    root: userCssClasses.root,
    header: userCssClasses.header,
    headerIcon: userCssClasses.headerIcon,
    headerTitle: userCssClasses.headerTitle,
    suggestions: userCssClasses.suggestions,
  };

  const renderState: {
    templateProps?: PreparedTemplateProps<PromptSuggestionsTemplates>;
  } = {};

  const widget = connectPromptSuggestions(
    (props, isFirstRendering) => {
      if (isFirstRendering) {
        renderState.templateProps = prepareTemplateProps({
          defaultTemplates,
          templatesConfig: props.instantSearchInstance.templatesConfig,
          templates,
        });
        return;
      }

      const titleIconComponent = templates.titleIcon
        ? () => (
            <TemplateComponent
              {...renderState.templateProps}
              templateKey="titleIcon"
              rootTagName="span"
            />
          )
        : undefined;

      // Get the title text from the template (title is always a string)
      const titleText = renderState.templateProps?.templates?.title || '';

      render(
        <PromptSuggestions
          suggestions={props.suggestions}
          status={props.status}
          onSuggestionClick={props.sendSuggestion}
          classNames={cssClasses}
          translations={{ title: titleText }}
          titleIconComponent={titleIconComponent}
        />,
        containerNode
      );
    },
    () => render(null, containerNode)
  )({ agentId, transport, context, ...rest });

  return {
    ...widget,
    $$widgetType: 'ais.promptSuggestions',
  };
} satisfies PromptSuggestionsWidget);
