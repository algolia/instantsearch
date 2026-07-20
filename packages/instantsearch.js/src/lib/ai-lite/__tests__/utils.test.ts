/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import {
  lastAssistantMessageIsCompleteWithToolCalls,
  tryParseErrorMessage,
} from '../utils';

import type { UIMessage } from '../types';

function assistantWithTools(
  tools: Array<{ resolved?: boolean; terminal?: boolean }>
): UIMessage {
  return {
    id: 'a1',
    role: 'assistant',
    parts: tools.map((t, i) => ({
      type: `tool-showProductCards`,
      toolCallId: `call-${i}`,
      state: t.resolved === false ? 'input-available' : 'output-available',
      input: {},
      ...(t.resolved === false
        ? {}
        : { output: { displayed: true }, terminal: t.terminal }),
    })) as UIMessage['parts'],
  } as UIMessage;
}

describe('tryParseErrorMessage', () => {
  it('returns the trimmed `message` from a JSON object', () => {
    expect(
      tryParseErrorMessage('{"message":"  Something went wrong  "}')
    ).toBe('Something went wrong');
  });

  it('returns the `message` from a full ErrorResponse payload', () => {
    expect(
      tryParseErrorMessage(
        '{"message":"Max steps per completion limit was reached","type":"MaxStepsPerCompletionError","statusCode":400}'
      )
    ).toBe('Max steps per completion limit was reached');
  });

  it('returns undefined for non-JSON input', () => {
    expect(tryParseErrorMessage('plain failure')).toBeUndefined();
  });

  it('returns undefined for JSON without a string `message`', () => {
    expect(tryParseErrorMessage('{"type":"CustomError"}')).toBeUndefined();
    expect(tryParseErrorMessage('{"message":123}')).toBeUndefined();
    expect(tryParseErrorMessage('{"message":"   "}')).toBeUndefined();
  });

  it('returns undefined for arrays and primitives', () => {
    expect(tryParseErrorMessage('[{"message":"nope"}]')).toBeUndefined();
    expect(tryParseErrorMessage('"just a string"')).toBeUndefined();
  });

  it('returns undefined for empty input', () => {
    expect(tryParseErrorMessage('')).toBeUndefined();
  });
});

describe('lastAssistantMessageIsCompleteWithToolCalls', () => {
  it('auto-continues when a resolved tool call is not terminal', () => {
    expect(
      lastAssistantMessageIsCompleteWithToolCalls({
        messages: [assistantWithTools([{ resolved: true }])],
      })
    ).toBe(true);
  });

  it('does NOT auto-continue when every resolved tool call is terminal', () => {
    expect(
      lastAssistantMessageIsCompleteWithToolCalls({
        messages: [assistantWithTools([{ resolved: true, terminal: true }])],
      })
    ).toBe(false);
  });

  it('auto-continues when at least one resolved call is non-terminal (mixed)', () => {
    expect(
      lastAssistantMessageIsCompleteWithToolCalls({
        messages: [
          assistantWithTools([
            { resolved: true, terminal: true },
            { resolved: true, terminal: false },
          ]),
        ],
      })
    ).toBe(true);
  });

  it('waits until all tool calls are resolved before continuing', () => {
    expect(
      lastAssistantMessageIsCompleteWithToolCalls({
        messages: [
          assistantWithTools([{ resolved: true }, { resolved: false }]),
        ],
      })
    ).toBe(false);
  });
});
