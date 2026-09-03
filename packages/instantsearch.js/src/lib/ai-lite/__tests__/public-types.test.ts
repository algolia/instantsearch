import type {
  ChatInit,
  ChatOnToolCallCallback,
  ToolResultSubmission,
  UIMessage,
} from 'instantsearch.js/es/lib/ai-lite';

type SearchMessage = UIMessage<
  unknown,
  {},
  {
    search: {
      input: { query: string };
      output: { hits: string[] };
    };
  }
>;

describe('ai-lite public types', () => {
  it('types tool result submission for its response', () => {
    const submitToolResult: ToolResultSubmission<SearchMessage> = () =>
      Promise.resolve();
    const onToolCall: ChatOnToolCallCallback<SearchMessage> = (
      { toolCall },
      addToolResult
    ) => {
      if (toolCall.dynamic) {
        return;
      }

      return addToolResult({
        tool: toolCall.toolName,
        toolCallId: toolCall.toolCallId,
        output: { hits: [] },
      });
    };
    const legacyOnToolCall: ChatOnToolCallCallback<SearchMessage> = ({
      toolCall,
    }) => {
      void toolCall;
    };
    const onToolError: ChatOnToolCallCallback<SearchMessage> = (
      { toolCall },
      addToolResult
    ) =>
      toolCall.dynamic
        ? undefined
        : addToolResult({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            state: 'output-error',
            errorText: 'Search failed.',
          });
    const init: Pick<ChatInit<SearchMessage>, 'onToolCall'> = {
      onToolCall({ toolCall }, addToolResult) {
        if (toolCall.dynamic) {
          return;
        }

        return addToolResult({
          tool: toolCall.toolName,
          toolCallId: toolCall.toolCallId,
          output: { hits: [] },
        });
      },
    };
    const legacyInit: Pick<ChatInit<SearchMessage>, 'onToolCall'> = {
      onToolCall({ toolCall }) {
        void toolCall;
      },
    };

    expect([
      submitToolResult,
      onToolCall,
      legacyOnToolCall,
      onToolError,
      init.onToolCall,
      legacyInit.onToolCall,
    ]).toEqual([
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
    ]);
  });
});
