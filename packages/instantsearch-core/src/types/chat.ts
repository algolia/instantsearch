import type { AbstractChat, ChatInit, UIMessage } from '../lib/chat';

/**
 * Tool message type extracted from chat messages
 */
export type ChatToolMessage = Extract<
  UIMessage['parts'][number],
  { type: `tool-${string}` }
>;

/**
 * Get the addToolResult method type from AbstractChat
 */
export type AddToolResult = AbstractChat<UIMessage>['addToolResult'];

/**
 * Simplified version of AddToolResult that only requires output parameter
 */
export type AddToolResultWithOutput = (
  params: Pick<Parameters<AddToolResult>[0], 'output'>
) => ReturnType<AddToolResult>;

/**
 * Props for client-side tool components
 */
export type ClientSideToolComponentProps = {
  message: ChatToolMessage;
  indexUiState: object;
  setIndexUiState: (state: object) => void;
  onClose: () => void;
  addToolResult: AddToolResultWithOutput;
};

/**
 * Client-side tool configuration
 */
export type ClientSideTool = {
  layoutComponent?: (props: ClientSideToolComponentProps) => unknown;
  addToolResult: AddToolResult;
  onToolCall?: (
    params: Parameters<
      NonNullable<ChatInit<UIMessage>['onToolCall']>
    >[0]['toolCall'] & {
      addToolResult: AddToolResultWithOutput;
    }
  ) => void;
};

/**
 * Record of client-side tools
 */
export type ClientSideTools = Record<string, ClientSideTool>;

/**
 * User-facing client-side tool configuration (without addToolResult which is bound automatically)
 */
export type UserClientSideTool = Omit<ClientSideTool, 'addToolResult'>;
