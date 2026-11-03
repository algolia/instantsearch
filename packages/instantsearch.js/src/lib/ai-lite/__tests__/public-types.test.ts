import type {
  ChatInit,
  ChatOnToolCallCallback,
  ProviderMetadata,
  ToolResultSubmission,
  UIMessage,
} from 'instantsearch-core';

// The provider metadata of AI SDK 5, 6 and 7 messages, from `@ai-sdk/provider`
// 2.0.5, 3.0.19 and 4.0.35.
type AiSdk5JSONValue =
  | null
  | string
  | number
  | boolean
  | { [key: string]: AiSdk5JSONValue }
  | AiSdk5JSONValue[];
type AiSdk5ProviderMetadata = Record<string, Record<string, AiSdk5JSONValue>>;
type AiSdk6JSONObject = { [key: string]: AiSdk6JSONValue | undefined };
type AiSdk6JSONValue =
  | null
  | string
  | number
  | boolean
  | AiSdk6JSONObject
  | AiSdk6JSONValue[];
type AiSdk6ProviderMetadata = Record<string, AiSdk6JSONObject>;
type AiSdk7JSONObject = { [key: string]: AiSdk7JSONValue | undefined };
type AiSdk7JSONValue =
  | null
  | string
  | number
  | boolean
  | Readonly<AiSdk7JSONObject>
  | readonly AiSdk7JSONValue[];
type AiSdk7ProviderMetadata = Record<string, AiSdk7JSONObject>;

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
      { toolCall, signal },
      addToolResult
    ) => {
      void signal;
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

  it('keeps provider metadata assignable to AI SDK 5, 6 and 7', () => {
    const providerMetadata: ProviderMetadata = {
      openai: {
        itemId: 'msg_1',
        annotations: [{ type: 'url_citation', url: 'https://example.com' }],
        refusal: null,
      },
    };

    const aiSdk5: AiSdk5ProviderMetadata[] = [providerMetadata];
    const aiSdk6: AiSdk6ProviderMetadata[] = [providerMetadata];
    const aiSdk7: AiSdk7ProviderMetadata[] = [providerMetadata];

    expect([...aiSdk5, ...aiSdk6, ...aiSdk7]).toEqual(
      Array(3).fill(providerMetadata)
    );
  });
});
