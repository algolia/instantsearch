import {
  categorizeFromToolCall,
  categorizeReasoning,
  getReasoningContext,
  summarizeReasoning,
} from '../reasoning';

import type { ChatMessageBase } from '../../../components/chat/types';

describe('categorizeReasoning', () => {
  test('returns the thinking fallback for empty input', () => {
    expect(categorizeReasoning('')).toEqual({
      label: 'Thinking\u2026',
      category: 'thinking',
    });
    expect(categorizeReasoning('   ')).toEqual({
      label: 'Thinking\u2026',
      category: 'thinking',
    });
  });

  test('matches keyword rules with the documented precedence', () => {
    expect(categorizeReasoning('comparing the price and budget').category).toBe(
      'pricing'
    );
    expect(categorizeReasoning('narrow down by category').category).toBe(
      'filtering'
    );
    expect(categorizeReasoning('let me search the catalogue').category).toBe(
      'searching'
    );
    expect(categorizeReasoning('I will plan the next step').category).toBe(
      'planning'
    );
  });

  test('flags PII/secrets for redaction', () => {
    const summary = categorizeReasoning('the api_key is sk-1234, searching');
    expect(summary.redact).toBe(true);
  });

  test('inspects content that falls within the last 2KB of the buffer', () => {
    const longPrefix = 'x'.repeat(4000);
    const summary = categorizeReasoning(`${longPrefix} the price is too high`);
    expect(summary.category).toBe('pricing');
  });

  test('ignores content older than the last 2KB of the buffer', () => {
    const stalePricing = 'the price is high ';
    const recentFiller = 'x'.repeat(4000);
    const summary = categorizeReasoning(`${stalePricing}${recentFiller}`);
    expect(summary.category).toBe('thinking');
  });
});

describe('categorizeFromToolCall', () => {
  test('derives a label from the search index tool input', () => {
    expect(
      categorizeFromToolCall({
        type: 'tool-algolia_search_index',
        input: { indexName: 'products' },
      })
    ).toEqual({ category: 'tool', label: 'Searching the products index' });
  });

  test('falls back to a generic label without an index name', () => {
    expect(
      categorizeFromToolCall({ type: 'tool-algolia_search_index' })
    ).toEqual({ category: 'tool', label: 'Searching the catalogue' });
  });

  test('humanizes unknown tool names', () => {
    expect(categorizeFromToolCall({ type: 'tool-do_a_thing' })).toEqual({
      category: 'tool',
      label: 'Running Do A Thing',
    });
  });
});

describe('summarizeReasoning', () => {
  const message: ChatMessageBase = { id: '1', role: 'assistant', parts: [] };

  test('tier 1: uses the first sentence of a short server summary', () => {
    const summary = summarizeReasoning(
      'Comparing the top matches. Then ranking them.',
      { message, streaming: false }
    );
    expect(summary.label).toBe('Comparing the top matches.');
  });

  test('tier 2: prefers the in-flight tool call when streaming', () => {
    const summary = summarizeReasoning('some very long reasoning '.repeat(50), {
      message,
      streaming: true,
      lastToolCall: {
        type: 'tool-algolia_search_index',
        input: { indexName: 'products' },
      } as unknown as ChatMessageBase['parts'][number] & {
        type: `tool-${string}`;
      },
    });
    expect(summary.label).toBe('Searching the products index');
  });

  test('tier 3: heuristic categorizer for long streaming text', () => {
    const summary = summarizeReasoning('narrowing down by category '.repeat(50), {
      message,
      streaming: true,
    });
    expect(summary.category).toBe('filtering');
  });
});

describe('getReasoningContext', () => {
  test('concatenates reasoning parts and tracks streaming + last tool', () => {
    const message: ChatMessageBase = {
      id: '1',
      role: 'assistant',
      parts: [
        { type: 'reasoning', text: 'first ' },
        {
          type: 'tool-algolia_search_index',
          input: { indexName: 'products' },
        } as unknown as ChatMessageBase['parts'][number],
        { type: 'reasoning', text: 'second', state: 'streaming' },
      ],
    };

    const ctx = getReasoningContext(message);

    expect(ctx.text).toBe('first second');
    expect(ctx.streaming).toBe(true);
    expect(ctx.lastToolCall?.type).toBe('tool-algolia_search_index');
  });
});
