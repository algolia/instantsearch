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
export type AddToolOutput = AbstractChat<UIMessage>['addToolOutput'];

export type AddToolOutputWithOutput = (
  params: Pick<Parameters<AddToolOutput>[0], 'output'>
) => ReturnType<AddToolOutput>;

export type ClientSideToolComponentProps = {
  message: ChatToolMessage;
  indexUiState: object;
  setIndexUiState: (state: object) => void;
  onClose: () => void;
  addToolOutput: AddToolOutputWithOutput;
};

export type ClientSideToolComponent = (
  props: ClientSideToolComponentProps
) => JSX.Element;

export type ClientSideTool = {
  layoutComponent?: ClientSideToolComponent;
  addToolOutput: AddToolOutput;
  onToolCall?: (
    params: Parameters<
      NonNullable<ChatInit<UIMessage>['onToolCall']>
    >[0]['toolCall'] & {
      addToolOutput: AddToolOutputWithOutput;
    }
  ) => void;
};
export type ClientSideTools = Record<string, ClientSideTool>;

export type UserClientSideTool = Omit<ClientSideTool, 'addToolOutput'>;
export type UserClientSideTools = Record<string, UserClientSideTool>;
