/** @jsx h */

import { createPromptSuggestionsComponent } from 'instantsearch-ui-components';
import { h, render } from 'preact';

import TemplateComponent from '../../components/Template/Template';
import connectChat from '../../connectors/chat/connectChat';
import { prepareTemplateProps } from '../../lib/templating';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
  warning,
} from '../../lib/utils';

import type {
  ChatTransport,
  ChatRenderState,
} from '../../connectors/chat/connectChat';
import type { PreparedTemplateProps } from '../../lib/templating';
import type {
  Template,
  InstantSearch,
  IndexWidget,
  InitOptions,
} from '../../types';
import type { PromptSuggestionsClassNames } from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({
  name: 'prompt-suggestions',
});

const PromptSuggestions = createPromptSuggestionsComponent({
  createElement: h,
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

const defaultTemplates: Required<PromptSuggestionsTemplates> = {
  title: 'Ask a question about this product:',
  titleIcon: '',
};

/**
 * The `promptSuggestions` widget displays prompt suggestions from the Algolia Agent API
 * based on page context (e.g., product data on a PDP). Clicking a suggestion opens the
 * chat and sends the suggestion as a message.
 */
function promptSuggestions(widgetParams: PromptSuggestionsWidgetParams) {
  const {
    container,
    agentId,
    transport,
    context,
    cssClasses: userCssClasses = {},
    templates = {},
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  if (!agentId && !transport) {
    throw new Error(withUsage('Either `agentId` or `transport` is required.'));
  }

  if (!context) {
    throw new Error(withUsage('The `context` option is required.'));
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

  let hasSentContext = false;
  let instantSearchInstance: InstantSearch;
  let parentIndex: IndexWidget;

  // Create an internal chat widget for fetching suggestions
  const suggestionsChat = connectChat(
    (props, isFirstRendering) => {
      const { suggestions, status, sendMessage } = props;

      if (isFirstRendering) {
        renderState.templateProps = prepareTemplateProps({
          defaultTemplates,
          templatesConfig: props.instantSearchInstance.templatesConfig,
          templates,
        });
        return;
      }

      // Send context on first ready state to get suggestions
      if (status === 'ready' && !hasSentContext) {
        hasSentContext = true;
        sendMessage({ text: JSON.stringify(context) });
        return;
      }

      // Map chat status to our simpler status
      let uiStatus: 'idle' | 'loading' | 'ready';
      if (status === 'submitted' || status === 'streaming') {
        uiStatus = 'loading';
      } else if (status === 'ready' && suggestions && suggestions.length > 0) {
        uiStatus = 'ready';
      } else {
        uiStatus = 'idle';
      }

      // When a suggestion is clicked, send to the MAIN chat
      const handleSuggestionClick = (suggestion: string) => {
        const indexId = parentIndex.getIndexId();
        const mainChat = instantSearchInstance.renderState[indexId]?.chat as
          | ChatRenderState
          | undefined;

        if (!mainChat) {
          warning(
            false,
            'PromptSuggestions: Chat widget not found. Make sure you have a Chat widget in your InstantSearch instance.'
          );
          return;
        }

        // Open the chat if not already open
        if (!mainChat.open) {
          mainChat.setOpen(true);
        }

        // Send the suggestion as a message
        mainChat.sendMessage({ text: suggestion });
      };

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
          suggestions={suggestions || []}
          status={uiStatus}
          onSuggestionClick={handleSuggestionClick}
          classNames={cssClasses}
          translations={{ title: titleText }}
          titleIconComponent={titleIconComponent}
        />,
        containerNode
      );
    },
    () => render(null, containerNode)
  )({ agentId, transport });

  return {
    ...suggestionsChat,
    $$type: 'ais.promptSuggestions',
    $$widgetType: 'ais.promptSuggestions',

    init(initOptions: InitOptions) {
      instantSearchInstance = initOptions.instantSearchInstance;
      parentIndex = initOptions.parent;
      suggestionsChat.init(initOptions);
    },
  };
}

export default promptSuggestions;
