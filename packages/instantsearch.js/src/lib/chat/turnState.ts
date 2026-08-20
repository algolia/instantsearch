import {
  createClientSideToolContextExtras,
  findTool,
} from 'instantsearch-ui-components';

import type { AbstractChat, UIMessage } from '../ai-lite';
import type {
  ChatMessageBase,
  ChatRecordsStore,
  ChatToolMessage,
  ChatTurnState,
  ClientSideTools,
  ClientSideToolStateContext,
  MessageScopedClientSideTool,
} from 'instantsearch-ui-components';

type ChatTurnStateOptions<TUiMessage extends UIMessage> = {
  chat: AbstractChat<TUiMessage>;
  tools: ClientSideTools;
  showReasoning: boolean;
  indexUiState: object;
  setIndexUiState: (state: object) => void;
  getFallbackRecords: () => ChatRecordsStore;
  onReload: (messageId?: string) => void;
  onClose: () => void;
  onNewConversation?: () => void;
  setInput?: (input: string) => void;
  open: boolean;
};

/**
 * The chat's own account of the current turn, in the shape every chat
 * component reads it from `context`.
 *
 * All of it but `showLoader` is a plain read of the chat instance, which is
 * where these are defined. `showLoader` is the one decision that also needs
 * the tool registry, and the registry lives out here with the connector — so
 * this is the layer that can answer the whole thing at once.
 */
export function getChatTurnState<TUiMessage extends UIMessage>(
  options: ChatTurnStateOptions<TUiMessage>
): ChatTurnState<TUiMessage> {
  const { chat } = options;

  return {
    phase: chat.phase,
    activePart: chat.activePart,
    hasActiveReasoning: chat.hasActiveReasoning,
    isBusy: chat.isBusy,
    lastMessage: chat.lastMessage,
    showLoader: getShowLoader(options),
  };
}

/**
 * Whether the progress loader should be shown below the transcript.
 *
 * The turn's own account of its progress — `phase`, `hasActiveReasoning` —
 * comes from the chat instance. On top of that sit exactly two overrides that
 * are not derivable from the messages:
 *
 * - a visible, streaming reasoning disclosure already shows progress, and
 * - a tool may decline to render for the turn, which leaves nothing on screen.
 */
function getShowLoader<TUiMessage extends UIMessage>({
  chat,
  tools,
  showReasoning,
  indexUiState,
  setIndexUiState,
  getFallbackRecords,
  onReload,
  onClose,
  onNewConversation,
  setInput,
  open,
}: ChatTurnStateOptions<TUiMessage>): boolean {
  const phase = chat.phase;

  if (phase === 'idle') {
    return false;
  }
  if (phase === 'awaiting-response') {
    return true;
  }

  // An active disclosure carries its own progress affordance, so the loader
  // would double it. Settled reasoning still shows it: the answer has not
  // started.
  if (showReasoning && chat.hasActiveReasoning) {
    return false;
  }
  if (phase === 'answering') {
    return false;
  }

  const lastMessage = chat.lastMessage;
  // The progress part, not the literal last one: a trailing part that renders
  // nothing must not be the thing that decides the loader is done.
  const lastPart = chat.lastProgressPart;
  const tool = lastPart
    ? (findTool(lastPart.type, tools) as
        | MessageScopedClientSideTool
        | undefined)
    : undefined;

  // A part its tool declines to render leaves nothing on screen, so the turn
  // still reads as in progress: keep the loader up rather than letting a
  // settled-but-invisible part terminate it. Building the context is only
  // worth it for a tool that actually declares an opinion.
  if (tool?.shouldRender && lastPart && lastMessage) {
    const context: ClientSideToolStateContext<ChatMessageBase> = {
      messages: chat.messages,
      status: chat.status,
      phase,
      error: chat.error,
      open,
      activePart: chat.activePart,
      hasActiveReasoning: chat.hasActiveReasoning,
      isBusy: chat.isBusy,
      lastMessage,
      tools,
      sendMessage:
        chat.sendMessage as ClientSideToolStateContext<ChatMessageBase>['sendMessage'],
      regenerate: chat.regenerate,
      stop: chat.stop,
      setInput,
      onReload,
      onNewConversation,
      onClose,
      ...createClientSideToolContextExtras<ChatMessageBase>({
        tool,
        parentMessage: lastMessage,
        part: lastPart as ChatToolMessage,
        indexUiState,
        setIndexUiState,
        getFallbackRecords,
      }),
    };

    if (tool.shouldRender(context) === false) {
      return true;
    }
  }

  if (phase === 'calling-tool') {
    return !tool?.streamInput;
  }

  return true;
}
