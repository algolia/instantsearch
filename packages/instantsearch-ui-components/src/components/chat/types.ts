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

export type AddToolResultWithOutput = (
  params: Pick<Parameters<AddToolResult>[0], 'output'>
) => ReturnType<AddToolResult>;

export type SearchToolInput = {
  query: string;
  number_of_results?: number;
  facet_filters?: string[][];
};

export type ApplyFiltersParams = {
  query?: string;
  facetFilters?: string[][];
};

export type ClientSideToolComponentProps = {
  message: ChatToolMessage;
  indexUiState: object;
  setIndexUiState: (state: object) => void;
  onClose: () => void;
  addToolResult: AddToolResultWithOutput;
  applyFilters: (params: ApplyFiltersParams) => void;
};

export type ClientSideToolComponent = (
  props: ClientSideToolComponentProps
) => JSX.Element;

export type ClientSideTool = {
  layoutComponent?: ClientSideToolComponent;
  addToolResult: AddToolResult;
  onToolCall?: (
    params: Parameters<
      NonNullable<ChatInit<UIMessage>['onToolCall']>
    >[0]['toolCall'] & {
      addToolResult: AddToolResultWithOutput;
    }
  ) => void;
  applyFilters: (params: ApplyFiltersParams) => void;
};
export type ClientSideTools = Record<string, ClientSideTool>;

export type UserClientSideTool = Omit<
  ClientSideTool,
  'addToolResult' | 'applyFilters'
>;
export type UserClientSideTools = Record<string, UserClientSideTool>;
