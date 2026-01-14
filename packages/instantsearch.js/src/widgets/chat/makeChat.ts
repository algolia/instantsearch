import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from 'ai';

import { Chat } from '../../lib/chat/chat';
import { getAlgoliaAgent, getAppIdAndApiKey } from '../../lib/utils';

import type { ChatTransport } from '../../connectors/chat/connectChat';
import type {
  // type AbstractChat,
  // type ChatInit as ChatInitAi,
  UIMessage,
} from '../../lib/chat/chat';
import type { InstantSearch } from '../../types';
import type {
  AddToolResultWithOutput,
  UserClientSideTool,
} from 'instantsearch-ui-components';

export function makeChatInstance(
  instantSearchInstance: InstantSearch,
  options: ChatTransport,
  tools: Record<string, Omit<UserClientSideTool, 'layoutComponent'>> = {}
): Chat<UIMessage> {
  let transport;
  const [appId, apiKey] = getAppIdAndApiKey(instantSearchInstance.client);

  // Filter out custom data parts (like data-suggestions) that the backend doesn't accept
  const filterDataParts = (messages: UIMessage[]): UIMessage[] =>
    messages.map((message) => ({
      ...message,
      parts: message.parts?.filter(
        (part) => !('type' in part && part.type.startsWith('data-'))
      ),
    }));

  const agentId = 'agentId' in options ? options.agentId : undefined;

  if ('transport' in options && options.transport) {
    const originalPrepare = options.transport.prepareSendMessagesRequest;
    transport = new DefaultChatTransport({
      ...options.transport,
      prepareSendMessagesRequest: (params) => {
        // Call the original prepareSendMessagesRequest if it exists,
        // otherwise construct the default body
        const preparedOrPromise = originalPrepare
          ? originalPrepare(params)
          : { body: { ...params } };
        // Then filter out data-* parts
        const applyFilter = (prepared: { body: object }) => ({
          ...prepared,
          body: {
            ...prepared.body,
            messages: filterDataParts(
              (prepared.body as { messages: UIMessage[] }).messages
            ),
          },
        });

        // Handle both sync and async cases
        if (preparedOrPromise && 'then' in preparedOrPromise) {
          return preparedOrPromise.then(applyFilter);
        }
        return applyFilter(preparedOrPromise);
      },
    });
  }
  if ('agentId' in options && options.agentId) {
    if (!appId || !apiKey) {
      throw new Error(
        'Could not extract Algolia credentials from the search client.'
      );
    }
    const baseApi = `https://${appId}.algolia.net/agent-studio/1/agents/${agentId}/completions?compatibilityMode=ai-sdk-5`;
    transport = new DefaultChatTransport({
      api: baseApi,
      headers: {
        'x-algolia-application-id': appId,
        'x-algolia-api-Key': apiKey,
        'x-algolia-agent': getAlgoliaAgent(instantSearchInstance.client),
      },
      prepareSendMessagesRequest: ({ messages, trigger, ...rest }) => {
        return {
          // Bypass cache when regenerating to ensure fresh responses
          api:
            trigger === 'regenerate-message'
              ? `${baseApi}&cache=false`
              : baseApi,
          body: {
            ...rest,
            messages: filterDataParts(messages),
          },
        };
      },
    });
  }
  if (!transport) {
    throw new Error(
      'You need to provide either an `agentId` or a `transport`.'
    );
  }

  // if ('chat' in options) {
  //   return options.chat;
  // }

  const _chatInstance: Chat<UIMessage> = new Chat({
    ...options,
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall({ toolCall }) {
      const tool = tools[toolCall.toolName];

      if (!tool) {
        if (__DEV__) {
          throw new Error(
            `No tool implementation found for "${toolCall.toolName}". Please provide a tool implementation in the \`tools\` prop.`
          );
        }

        return _chatInstance.addToolResult({
          output: `No tool implemented for "${toolCall.toolName}".`,
          tool: toolCall.toolName,
          toolCallId: toolCall.toolCallId,
        });
      }

      if (tool.onToolCall) {
        const addToolResult: AddToolResultWithOutput = ({ output }) =>
          _chatInstance.addToolResult({
            output,
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
          });

        return tool.onToolCall({
          ...toolCall,
          addToolResult,
        });
      }

      return Promise.resolve();
    },
  });

  return _chatInstance;
}
