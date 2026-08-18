/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import {
  lastAssistantMessageIsCompleteWithToolCalls,
  tryParseErrorMessage,
} from '../utils';

import type { UIMessage } from '../types';

const assistantMessage = (parts: unknown[]) =>
  [
    { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'hi' }] },
    { id: 'a1', role: 'assistant', parts },
  ] as unknown as UIMessage[];

const resolvedToolPart = (
  extra: Record<string, unknown> = {},
  toolCallId = 'call-1'
) => ({
  type: 'tool-search',
  toolCallId,
  state: 'output-available',
  input: { query: 'shirt' },
  output: { hits: [] },
  ...extra,
});

const doneTextPart = { type: 'text', text: 'Here you go.', state: 'done' };

describe('lastAssistantMessageIsCompleteWithToolCalls', () => {
  it('continues a turn whose client tool calls are all resolved', () => {
    expect(
      lastAssistantMessageIsCompleteWithToolCalls({
        messages: assistantMessage([resolvedToolPart()]),
      })
    ).toBe(true);
  });

  // Matches the AI SDK's fix (vercel/ai#9944): a provider-executed call is the
  // provider's to answer, so the turn is already complete.
  it('does not continue a turn made of provider-executed tool calls', () => {
    expect(
      lastAssistantMessageIsCompleteWithToolCalls({
        messages: assistantMessage([
          { type: 'step-start' },
          resolvedToolPart({ providerExecuted: true }),
          doneTextPart,
        ]),
      })
    ).toBe(false);
  });

  it('still continues when the last step includes a non-provider-executed tool call', () => {
    expect(
      lastAssistantMessageIsCompleteWithToolCalls({
        messages: assistantMessage([
          { type: 'step-start' },
          resolvedToolPart({ providerExecuted: true }, 'call-server'),
          resolvedToolPart({}, 'call-client'),
        ]),
      })
    ).toBe(true);
  });

  it('only looks at the last step', () => {
    // The resolved call belongs to a step the model already answered — the
    // current step has no tool call to continue on.
    expect(
      lastAssistantMessageIsCompleteWithToolCalls({
        messages: assistantMessage([
          { type: 'step-start' },
          resolvedToolPart(),
          { type: 'step-start' },
          doneTextPart,
        ]),
      })
    ).toBe(false);
  });

  it('ignores steps that are not started explicitly', () => {
    // Streams without `start-step` chunks produce no `step-start` part; the
    // whole message is then a single step.
    expect(
      lastAssistantMessageIsCompleteWithToolCalls({
        messages: assistantMessage([resolvedToolPart(), doneTextPart]),
      })
    ).toBe(true);
  });

  it('does not continue while a tool call is still pending', () => {
    expect(
      lastAssistantMessageIsCompleteWithToolCalls({
        messages: assistantMessage([
          { type: 'step-start' },
          {
            ...resolvedToolPart(),
            state: 'input-available',
            output: undefined,
          },
        ]),
      })
    ).toBe(false);
  });
});

describe('tryParseErrorMessage', () => {
  it('returns the trimmed `message` from a JSON object', () => {
    expect(tryParseErrorMessage('{"message":"  Something went wrong  "}')).toBe(
      'Something went wrong'
    );
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
