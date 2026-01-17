// Import AI library. While this imports at the top level, the actual AI library
// code is only executed when loadAI() is called and the AbstractChat class is instantiated.
// This prevents IE11 from crashing, as the TransformStream code in the AI library
// won't run unless you actually use the chat widget.
import * as ai from 'ai';

import type {
  AbstractChat,
  ChatInit as ChatInitAi,
  UIMessage,
  ChatStatus,
  ChatState as BaseChatState,
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from 'ai';

export type { UIMessage, ChatInitAi, ChatStatus, BaseChatState };

export type AIModule = {
  AbstractChat: typeof AbstractChat;
  DefaultChatTransport: typeof DefaultChatTransport;
  lastAssistantMessageIsCompleteWithToolCalls: typeof lastAssistantMessageIsCompleteWithToolCalls;
};

/**
 * Gets the AI library. This is done to prevent IE11 from crashing when
 * the chat widget is present in the UMD bundle.
 *
 * The AI library is imported at the top level (to avoid code-splitting in UMD)
 * but the actual code execution is deferred until this function is called and
 * AbstractChat is instantiated. This prevents IE11 from executing the AI library
 * code (which uses TransformStream, etc.) until the chat widget is explicitly used.
 */
export function loadAI(): AIModule {
  return ai as unknown as AIModule;
}
