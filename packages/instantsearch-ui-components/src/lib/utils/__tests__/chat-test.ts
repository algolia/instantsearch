import { getHitsByObjectID } from '../chat';

import type { ChatMessageBase } from '../../../components';

describe('getHitsByObjectID', () => {
  test('collects hits from a search tool output keyed by objectID', () => {
    const messages: ChatMessageBase[] = [
      {
        id: '1',
        role: 'assistant',
        parts: [
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'search',
            state: 'output-available',
            input: { query: 'shoes' },
            output: {
              hits: [
                { objectID: '1', name: 'Runner' },
                { objectID: '2', name: 'Sneaker' },
              ],
            },
          },
        ],
      },
    ];

    expect(getHitsByObjectID(messages)).toEqual({
      1: { objectID: '1', name: 'Runner' },
      2: { objectID: '2', name: 'Sneaker' },
    });
  });

  test('supports the MCP server search tool name shim', () => {
    const messages: ChatMessageBase[] = [
      {
        id: '1',
        role: 'assistant',
        parts: [
          {
            type: 'tool-algolia_search_index_products',
            toolCallId: 'search',
            state: 'output-available',
            input: { query: 'shoes' },
            output: { hits: [{ objectID: '1', name: 'Runner' }] },
          },
        ],
      },
    ];

    expect(getHitsByObjectID(messages)).toEqual({
      1: { objectID: '1', name: 'Runner' },
    });
  });

  test('merges hits across several messages, last write wins per objectID', () => {
    const messages: ChatMessageBase[] = [
      {
        id: '1',
        role: 'assistant',
        parts: [
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'search-1',
            state: 'output-available',
            input: { query: 'shoes' },
            output: { hits: [{ objectID: '1', name: 'Runner' }] },
          },
        ],
      },
      {
        id: '2',
        role: 'assistant',
        parts: [
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'search-2',
            state: 'output-available',
            input: { query: 'running shoes' },
            output: {
              hits: [
                { objectID: '1', name: 'Runner Pro' },
                { objectID: '3', name: 'Trail' },
              ],
            },
          },
        ],
      },
    ];

    expect(getHitsByObjectID(messages)).toEqual({
      1: { objectID: '1', name: 'Runner Pro' },
      3: { objectID: '3', name: 'Trail' },
    });
  });

  test('ignores non-search tools, pending states, and invalid hits', () => {
    const messages: ChatMessageBase[] = [
      {
        id: '1',
        role: 'assistant',
        parts: [
          { type: 'text', text: 'Here you go' },
          {
            type: 'tool-algolia_display_results',
            toolCallId: 'display',
            state: 'output-available',
            input: {},
            output: { groups: [{ results: [{ objectID: '9' }] }] },
          },
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'streaming',
            state: 'input-available',
            input: { query: 'shoes' },
          },
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'search',
            state: 'output-available',
            input: { query: 'shoes' },
            output: {
              hits: [{ objectID: '1', name: 'Runner' }, { objectID: '' }, null],
            },
          },
        ],
      },
    ] as ChatMessageBase[];

    expect(getHitsByObjectID(messages)).toEqual({
      1: { objectID: '1', name: 'Runner' },
    });
  });

  test('keys hits by their bare `id` so display results can hydrate by stripped objectID', () => {
    const messages: ChatMessageBase[] = [
      {
        id: '1',
        role: 'assistant',
        parts: [
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'search',
            state: 'output-available',
            input: { query: 'sherlock' },
            output: {
              hits: [
                {
                  objectID: 'media-sample-data-84254',
                  id: 84254,
                  name: 'Hound',
                },
              ],
            },
          },
        ],
      },
    ] as ChatMessageBase[];

    // The display results tool references this record as `"84254"` (the
    // backend strips the `media-sample-data-` prefix), so both keys resolve
    // to the same hit.
    const map = getHitsByObjectID(messages);
    expect(map['media-sample-data-84254']).toEqual({
      objectID: 'media-sample-data-84254',
      id: 84254,
      name: 'Hound',
    });
    expect(map['84254']).toBe(map['media-sample-data-84254']);
  });

  test('returns an empty map when there are no search outputs', () => {
    expect(getHitsByObjectID([])).toEqual({});
  });
});
