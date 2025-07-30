export type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error';
export type ChatRole = 'data' | 'user' | 'assistant' | 'system';

/**
 * A text part of a message.
 */
type TextUIPart = {
  type: 'text';
  /**
   * The text content.
   */
  text: string;
  /**
   * CUSTOM: rendered markdown content.
   */
  markdown?: JSX.Element;
};
/**
 * A reasoning part of a message.
 */
type ReasoningUIPart = {
  type: 'reasoning';
  /**
   * The reasoning text.
   */
  reasoning: string;
  details: Array<
    | {
        type: 'text';
        text: string;
        signature?: string;
      }
    | {
        type: 'redacted';
        data: string;
      }
  >;
};

/**
Typed tool call that is returned by generateText and streamText.
It contains the tool call ID, the tool name, and the tool arguments.
 */
interface ToolCall<TName extends string, TArgs> {
  /**
  ID of the tool call. This ID is used to match the tool call with the tool result.
   */
  toolCallId: string;
  /**
  Name of the tool that is being called.
   */
  toolName: TName;
  /**
  Arguments of the tool call. This is a JSON-serializable object that matches the tool's input schema.
     */
  args: TArgs;
}

/**
Typed tool result that is returned by `generateText` and `streamText`.
It contains the tool call ID, the tool name, the tool arguments, and the tool result.
 */
interface ToolResult<TName extends string, TArgs, TResult> {
  /**
  ID of the tool call. This ID is used to match the tool call with the tool result.
     */
  toolCallId: string;
  /**
  Name of the tool that was called.
     */
  toolName: TName;
  /**
  Arguments of the tool call. This is a JSON-serializable object that matches the tool's input schema.
       */
  args: TArgs;
  /**
  Result of the tool call. This is the result of the tool's execution.
       */
  result: TResult;
}

type ToolInvocation =
  | ({
      state: 'partial-call';
      step?: number;
    } & ToolCall<string, any>)
  | ({
      state: 'call';
      step?: number;
    } & ToolCall<string, any>)
  | ({
      state: 'result';
      step?: number;
    } & ToolResult<string, any, any>);
/**
 * A tool invocation part of a message.
 */
type ToolInvocationUIPart = {
  type: 'tool-invocation';
  /**
   * The tool invocation.
   */
  toolInvocation: ToolInvocation;
};
/**
 * A source part of a message.
 */
type SourceUIPart = {
  type: 'source';
  /**
   * The source.
   */
  source: any;
};
/**
 * A file part of a message.
 */
type FileUIPart = {
  type: 'file';
  mimeType: string;
  data: string;
};
/**
 * A step boundary part of a message.
 */
type StepStartUIPart = {
  type: 'step-start';
};

type UIPart =
  | TextUIPart
  | ReasoningUIPart
  | ToolInvocationUIPart
  | SourceUIPart
  | FileUIPart
  | StepStartUIPart;

export type ChatMessageBase = {
  id: string;
  role: ChatRole;
  content: string;
  parts: UIPart[];
};
