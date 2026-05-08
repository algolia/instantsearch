import type {
  AbstractChat,
  ChatInit as ChatInitAi,
  UIMessage,
} from '../../lib/chat';
import type { SendEventForHits } from '../../lib/utils';
import type { SearchParameters } from 'algoliasearch-helper';

type ChatToolMessage = Extract<
  UIMessage['parts'][number],
  { type: `tool-${string}` }
>;

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
  applyFilters: (params: ApplyFiltersParams) => SearchParameters;
  sendEvent: SendEventForHits;
};

export type ClientSideToolComponent = (
  props: ClientSideToolComponentProps
) => any;

export type ClientSideTool = {
  layoutComponent?: ClientSideToolComponent;
  streamInput?: boolean;
  addToolResult: AddToolResult;
  sendEvent?: SendEventForHits;
  onToolCall?: (
    params: Parameters<
      NonNullable<ChatInitAi<UIMessage>['onToolCall']>
    >[0]['toolCall'] & {
      addToolResult: AddToolResultWithOutput;
    }
  ) => void;
  applyFilters: (params: ApplyFiltersParams) => SearchParameters;
};

export type ClientSideTools = Record<string, ClientSideTool>;

export type UserClientSideTool = Omit<
  ClientSideTool,
  'addToolResult' | 'applyFilters' | 'sendEvent'
>;
export type UserClientSideTools = Record<string, UserClientSideTool>;
