import {
  buildConversationHits,
  extractSearchHits,
  normalizeDisplayResultsOutput,
} from '../display-results';

import type { UIMessage } from '../../ai-lite';

describe('extractSearchHits', () => {
  test('returns null for non-objects', () => {
    expect(extractSearchHits(null)).toBeNull();
    expect(extractSearchHits('foo')).toBeNull();
    expect(extractSearchHits(undefined)).toBeNull();
  });

  test('reads single-index `hits` array', () => {
    const hits = [{ objectID: '1' }];
    expect(extractSearchHits({ hits })).toBe(hits);
  });

  test('reads the first response from a multi-index `results` array', () => {
    const hits = [{ objectID: '2' }];
    expect(extractSearchHits({ results: [{ hits }] })).toBe(hits);
  });

  test('returns null when the shape is unrecognized', () => {
    expect(extractSearchHits({ foo: 'bar' })).toBeNull();
    expect(extractSearchHits({ results: [] })).toBeNull();
  });
});

describe('buildConversationHits', () => {
  test('collects hits from assistant search tool calls', () => {
    const messages: UIMessage[] = [
      {
        id: '1',
        role: 'user',
        parts: [{ type: 'text', text: 'find shoes' }],
      },
      {
        id: '2',
        role: 'assistant',
        parts: [
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'a',
            state: 'output-available',
            input: { query: 'shoes' },
            output: {
              hits: [
                { objectID: '1', name: 'Sneaker' },
                { objectID: '2', name: 'Boot' },
              ],
            },
          } as UIMessage['parts'][number],
        ],
      },
    ];

    const lookup = buildConversationHits<{ objectID: string; name: string }>(
      messages
    );
    expect(lookup.size).toBe(2);
    expect(lookup.get('1')).toEqual({ objectID: '1', name: 'Sneaker' });
    expect(lookup.get('2')).toEqual({ objectID: '2', name: 'Boot' });
  });

  test('handles MCP-prefixed search tool names', () => {
    const messages: UIMessage[] = [
      {
        id: '1',
        role: 'assistant',
        parts: [
          {
            type: 'tool-algolia_search_index_products',
            toolCallId: 'b',
            state: 'output-available',
            input: { query: 'x' },
            output: { hits: [{ objectID: '42' }] },
          } as UIMessage['parts'][number],
        ],
      },
    ];

    expect(buildConversationHits(messages).get('42')).toEqual({
      objectID: '42',
    });
  });

  test('ignores tool calls still streaming input or output-error', () => {
    const messages: UIMessage[] = [
      {
        id: '1',
        role: 'assistant',
        parts: [
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'c',
            state: 'input-streaming',
            input: undefined,
          } as UIMessage['parts'][number],
        ],
      },
    ];
    expect(buildConversationHits(messages).size).toBe(0);
  });

  test('returns empty map for undefined input', () => {
    expect(buildConversationHits(undefined).size).toBe(0);
  });
});

describe('normalizeDisplayResultsOutput', () => {
  test('returns empty output for non-objects', () => {
    expect(normalizeDisplayResultsOutput(null)).toEqual({ groups: [] });
    expect(normalizeDisplayResultsOutput('foo')).toEqual({ groups: [] });
  });

  test('preserves known fields and drops unknown ones', () => {
    const parsed = normalizeDisplayResultsOutput({
      intro: 'hello',
      unknown: 'x',
      groups: [
        {
          title: 'Shoes',
          why: 'match',
          results: [{ objectID: '1', why: 'great fit' }],
        },
      ],
    });

    expect(parsed).toEqual({
      intro: 'hello',
      groups: [
        {
          title: 'Shoes',
          why: 'match',
          results: [{ objectID: '1', why: 'great fit' }],
        },
      ],
    });
  });

  test('drops results without an objectID', () => {
    const parsed = normalizeDisplayResultsOutput({
      groups: [{ title: 'g', results: [{}, { objectID: '1' }] }],
    });
    expect(parsed.groups[0].results).toEqual([{ objectID: '1' }]);
  });
});
