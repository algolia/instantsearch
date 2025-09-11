import type { AbstractChat, ChatInit, UIMessage } from 'ai';

export type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error';
export type ChatRole = 'data' | 'user' | 'assistant' | 'system';

export type ChatMessageBase = UIMessage;

export type ChatToolMessage = Extract<
  ChatMessageBase['parts'][number],
  { type: `tool-${string}` }
>;
export type ChatToolType = ChatToolMessage['type'];

export type { ChatInit } from 'ai';
export type AddToolResult = AbstractChat<UIMessage>['addToolResult'];

export type ClientSideTool = {
  type: ChatToolType;
  component: (props: {
    message: ChatToolMessage;
    indexUiState: object;
    setIndexUiState: (state: object) => void;
  }) => JSX.Element;
  onToolCall: (params: {
    toolCall: Parameters<
      NonNullable<ChatInit<ChatMessageBase>['onToolCall']>
    >[0]['toolCall'];
    addToolResult: AddToolResult;
  }) => void;
};
