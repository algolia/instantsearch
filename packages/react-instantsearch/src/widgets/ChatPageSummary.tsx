import { createChatMessageComponent, cx } from 'instantsearch-ui-components';
import React, { createElement, Fragment, useMemo } from 'react';
import {
  useChatPageSummary,
  useInstantSearch,
} from 'react-instantsearch-core';

import { createDefaultTools } from './Chat';

import type {
  AddToolResultWithOutput,
  ChatMessageProps,
  ClientSideTool,
  ClientSideTools,
  Pragma,
  RecommendComponentProps,
  RecordWithObjectID,
  UserClientSideTools,
} from 'instantsearch-ui-components';
import type { IndexUiState } from 'instantsearch.js';
import type { ChatStatus } from 'instantsearch.js/es/lib/ai-lite';
import type { UIMessage } from 'instantsearch.js/es/lib/chat';
import type { UseChatPageSummaryProps } from 'react-instantsearch-core';

export type ChatPageSummaryClassNames = Partial<{
  root: string;
  message: string;
  loader: string;
  error: string;
  cta: string;
}>;

type ItemComponent<TObject> = RecommendComponentProps<TObject>['itemComponent'];

export type ChatPageSummaryProps<
  TObject extends RecordWithObjectID = RecordWithObjectID,
  TUiMessage extends UIMessage = UIMessage
> = UseChatPageSummaryProps<TUiMessage> & {
  classNames?: ChatPageSummaryClassNames;
  /** Label displayed on the default CTA. Defaults to "Continue in chat". */
  ctaLabel?: string;
  /** Tool renderers; merged on top of the same defaults as `<Chat>`. */
  tools?: UserClientSideTools;
  /** Item renderer passed to the default search-index / recommend tools. */
  itemComponent?: ItemComponent<TObject>;
  /** Builds the URL used by the search-index tool when navigating away. */
  getSearchPageURL?: (nextUiState: IndexUiState) => string;
  /**
   * Custom CTA component. Receives the handler + whether the CTA is
   * actionable. Use this to plug your own button.
   */
  ctaComponent?: (props: {
    onClick: () => void;
    disabled: boolean;
    prompt: string;
  }) => JSX.Element | null;
  /**
   * Custom renderer for the streaming assistant message. When omitted, the
   * message is rendered with the same `ChatMessage` component (and tool
   * registry) the main `<Chat>` widget uses, so tool parts render inline.
   */
  messageComponent?: (props: {
    message?: TUiMessage;
    text: string;
    status: ChatStatus;
  }) => JSX.Element | null;
  /** Custom renderer for the loading state shown while text is empty. */
  loaderComponent?: () => JSX.Element | null;
  /** Custom renderer for the error state. */
  errorComponent?: (props: { error: Error }) => JSX.Element | null;
};

function getTextContent(message: UIMessage | undefined): string {
  if (!message?.parts) return '';
  return message.parts
    .map((part) => ('text' in part ? part.text : ''))
    .join('');
}

const ChatMessageUi = createChatMessageComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function ChatPageSummary<
  TObject extends RecordWithObjectID = RecordWithObjectID,
  TUiMessage extends UIMessage = UIMessage
>({
  classNames = {},
  ctaLabel = 'Continue in chat',
  ctaComponent: CtaComponent,
  messageComponent: MessageComponent,
  loaderComponent: LoaderComponent,
  errorComponent: ErrorComponent,
  tools: userTools,
  itemComponent,
  getSearchPageURL,
  ...connectorProps
}: ChatPageSummaryProps<TObject, TUiMessage>) {
  const {
    message,
    status,
    error,
    openChat,
    canHandoff,
    prompt,
    addToolResult,
  } = useChatPageSummary<TUiMessage>(connectorProps);

  const { indexUiState, setIndexUiState } = useInstantSearch();

  const tools = useMemo<ClientSideTools>(() => {
    const defaults = createDefaultTools(itemComponent, getSearchPageURL);
    const merged: UserClientSideTools = { ...defaults, ...userTools };
    const wrapped: ClientSideTools = {};
    Object.entries(merged).forEach(([key, tool]) => {
      const wrappedTool: ClientSideTool = {
        ...tool,
        addToolResult: addToolResult as AddToolResultWithOutput,
        applyFilters: (() => ({})) as unknown as ClientSideTool['applyFilters'],
        sendEvent: () => {},
      };
      wrapped[key] = wrappedTool;
    });
    return wrapped;
  }, [addToolResult, getSearchPageURL, itemComponent, userTools]);

  const text = getTextContent(message);
  const isStreaming = status === 'streaming' || status === 'submitted';
  const showLoader = isStreaming && !text && !message?.parts?.length;

  return (
    <div className={cx('ais-ChatPageSummary', classNames.root)}>
      {error ? (
        ErrorComponent ? (
          <ErrorComponent error={error} />
        ) : (
          <div
            className={cx('ais-ChatPageSummary-error', classNames.error)}
            role="alert"
          >
            {error.message}
          </div>
        )
      ) : null}

      {showLoader ? (
        LoaderComponent ? (
          <LoaderComponent />
        ) : (
          <div
            className={cx('ais-ChatPageSummary-loader', classNames.loader)}
            aria-busy="true"
          >
            Generating summary…
          </div>
        )
      ) : null}

      {message && !error ? (
        MessageComponent ? (
          <MessageComponent message={message} text={text} status={status} />
        ) : (
          <div
            className={cx('ais-ChatPageSummary-message', classNames.message)}
          >
            <ChatMessageUi
              message={message as ChatMessageProps['message']}
              status={status}
              tools={tools}
              indexUiState={indexUiState}
              setIndexUiState={setIndexUiState}
              onClose={() => {}}
            />
          </div>
        )
      ) : null}

      {CtaComponent ? (
        <CtaComponent
          onClick={openChat}
          disabled={!canHandoff}
          prompt={prompt}
        />
      ) : (
        <button
          type="button"
          className={cx('ais-ChatPageSummary-cta', classNames.cta)}
          onClick={openChat}
          disabled={!canHandoff}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
