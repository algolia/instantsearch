/** @jsx h */

import { createChatPromptSuggestionsComponent } from 'instantsearch-ui-components';
import { h, render } from 'preact';

import connectChatPageSuggestions from '../../connectors/chat-page-suggestions/connectChatPageSuggestions';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import type {
  ChatPageSuggestionsRenderState,
  ChatPageSuggestionsConnectorParams,
  ChatPageSuggestionsWidgetDescription,
} from '../../connectors/chat-page-suggestions/connectChatPageSuggestions';
import type { WidgetFactory, Renderer } from '../../types';
import type { ChatPromptSuggestionsClassNames } from 'instantsearch-ui-components';
import type { ComponentChildren } from 'preact';

const withUsage = createDocumentationMessageGenerator({
  name: 'chat-page-suggestions',
});

const ChatPromptSuggestions = createChatPromptSuggestionsComponent({
  createElement: h,
  Fragment: 'fragment',
});

export type ChatPageSuggestionsCSSClasses =
  Partial<ChatPromptSuggestionsClassNames>;

/**
 * Props passed to a custom `templates.layout`. Mirrors the connector render
 * state so a layout template owns the full markup.
 */
export type ChatPageSuggestionsLayoutTemplateProps = {
  suggestions: string[];
  isLoading: boolean;
  onSuggestionClick: (prompt: string) => void;
  isChatBusy: boolean;
};

export type ChatPageSuggestionsTemplates = {
  /**
   * Replaces the default pills layout with custom markup. Receives the full
   * render state — the template is responsible for rendering the list, the
   * loading state, and the click handlers.
   */
  layout?: (
    props: ChatPageSuggestionsLayoutTemplateProps
  ) => ComponentChildren;
};

type ChatPageSuggestionsWidgetParams = {
  /** CSS Selector or HTMLElement to insert the widget. */
  container: string | HTMLElement;
  /** CSS classes to add. */
  cssClasses?: ChatPageSuggestionsCSSClasses;
  /** Custom templates. */
  templates?: ChatPageSuggestionsTemplates;
  /**
   * Override the default click behavior (handoff to the chat widget). Receives
   * the prompt and a `sendToChat` callback you can use to fall through to the
   * default behavior after running custom logic (analytics, routing, etc.).
   */
  onSuggestionClick?: (
    prompt: string,
    helpers: { sendToChat: (prompt: string) => boolean }
  ) => void;
};

export type ChatPageSuggestionsWidget = WidgetFactory<
  ChatPageSuggestionsWidgetDescription & {
    $$widgetType: 'ais.chatPageSuggestions';
  },
  ChatPageSuggestionsConnectorParams,
  ChatPageSuggestionsWidgetParams
>;

const createRenderer =
  ({
    containerNode,
    cssClasses,
    maxSuggestions,
    templates,
    onSuggestionClickOverride,
  }: {
    containerNode: HTMLElement;
    cssClasses: ChatPageSuggestionsCSSClasses;
    maxSuggestions?: number;
    templates?: ChatPageSuggestionsTemplates;
    onSuggestionClickOverride?: ChatPageSuggestionsWidgetParams['onSuggestionClick'];
  }): Renderer<
    ChatPageSuggestionsRenderState,
    Partial<ChatPageSuggestionsWidgetParams>
  > =>
  (props) => {
    const {
      suggestions,
      isLoading,
      onSuggestionClick,
      isChatBusy,
      sendToChat,
    } = props;

    const handleClick = onSuggestionClickOverride
      ? (prompt: string) => onSuggestionClickOverride(prompt, { sendToChat })
      : onSuggestionClick;

    if (templates?.layout) {
      render(
        <fragment>
          {templates.layout({
            suggestions,
            isLoading,
            onSuggestionClick: handleClick,
            isChatBusy,
          })}
        </fragment>,
        containerNode
      );
      return;
    }

    render(
      <ChatPromptSuggestions
        classNames={cssClasses}
        suggestions={suggestions}
        isLoading={isLoading}
        onSuggestionClick={handleClick}
        skeletonCount={maxSuggestions}
        disabled={isChatBusy}
      />,
      containerNode
    );
  };

export default (function chatPageSuggestions(
  widgetParams: ChatPageSuggestionsWidgetParams &
    ChatPageSuggestionsConnectorParams
) {
  const {
    container,
    cssClasses = {},
    templates,
    onSuggestionClick: onSuggestionClickOverride,
    ...connectorParams
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const specializedRenderer = createRenderer({
    containerNode,
    cssClasses,
    maxSuggestions: connectorParams.maxSuggestions,
    templates,
    onSuggestionClickOverride,
  });

  const makeWidget = connectChatPageSuggestions(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget(connectorParams),
    $$widgetType: 'ais.chatPageSuggestions',
  };
} satisfies ChatPageSuggestionsWidget);
