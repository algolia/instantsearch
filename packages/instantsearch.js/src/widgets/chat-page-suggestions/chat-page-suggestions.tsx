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

const withUsage = createDocumentationMessageGenerator({
  name: 'chat-page-suggestions',
});

const ChatPromptSuggestions = createChatPromptSuggestionsComponent({
  createElement: h,
  Fragment: 'fragment',
});

export type ChatPageSuggestionsCSSClasses =
  Partial<ChatPromptSuggestionsClassNames>;

type ChatPageSuggestionsWidgetParams = {
  /** CSS Selector or HTMLElement to insert the widget. */
  container: string | HTMLElement;
  /** CSS classes to add. */
  cssClasses?: ChatPageSuggestionsCSSClasses;
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
  }: {
    containerNode: HTMLElement;
    cssClasses: ChatPageSuggestionsCSSClasses;
    maxSuggestions?: number;
  }): Renderer<
    ChatPageSuggestionsRenderState,
    Partial<ChatPageSuggestionsWidgetParams>
  > =>
  (props) => {
    const { suggestions, isLoading, onSuggestionClick, canHandoff } = props;

    render(
      <ChatPromptSuggestions
        classNames={cssClasses}
        suggestions={suggestions}
        isLoading={isLoading}
        onSuggestionClick={onSuggestionClick}
        skeletonCount={maxSuggestions}
        disabled={!canHandoff}
      />,
      containerNode
    );
  };

export default (function chatPageSuggestions(
  widgetParams: ChatPageSuggestionsWidgetParams &
    ChatPageSuggestionsConnectorParams
) {
  const { container, cssClasses = {}, ...connectorParams } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const specializedRenderer = createRenderer({
    containerNode,
    cssClasses,
    maxSuggestions: connectorParams.maxSuggestions,
  });

  const makeWidget = connectChatPageSuggestions(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget(connectorParams),
    $$widgetType: 'ais.chatPageSuggestions',
  };
} satisfies ChatPageSuggestionsWidget);
