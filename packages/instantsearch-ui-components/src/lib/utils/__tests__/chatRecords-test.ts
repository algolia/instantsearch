import {
  collectChatRecords,
  createChatRecordsStore,
  getHitsFromToolOutput,
} from '../chatRecords';

import type { ChatMessageBase, ChatToolMessage } from '../../../components';
import type { ChatRecord, ChatToolRecordsGetter } from '../chatRecords';

const searchPart = (
  toolCallId: string,
  hits: unknown[],
  type = 'tool-algolia_search_index'
) =>
  ({
    type,
    toolCallId,
    state: 'output-available',
    input: {},
    output: { hits },
  }) as ChatToolMessage;

const assistantMessage = (id: string, parts: unknown[]) =>
  ({ id, role: 'assistant', parts }) as ChatMessageBase;

// What the search and recommend tools declare.
const searchTools = {
  algolia_search_index: { getRecords: getHitsFromToolOutput },
};

describe('createChatRecordsStore', () => {
  test('keys merged records by objectID', () => {
    const store = createChatRecordsStore();

    store.merge([
      { objectID: '1', name: 'Runner' },
      { objectID: '2', name: 'Sneaker' },
    ]);

    expect(store.getAll()).toEqual({
      1: { objectID: '1', name: 'Runner' },
      2: { objectID: '2', name: 'Sneaker' },
    });
    expect(store.get('1')).toEqual({ objectID: '1', name: 'Runner' });
    expect(store.has('2')).toBe(true);
    expect(store.get('nope')).toBeUndefined();
    expect(store.has('nope')).toBe(false);
  });

  test('lets a later merge replace a stale record', () => {
    const store = createChatRecordsStore();

    store.merge([{ objectID: '1', name: 'Runner', __queryID: 'q1' }]);
    store.merge([{ objectID: '1', name: 'Runner Pro', __queryID: 'q2' }]);

    expect(store.get('1')).toEqual({
      objectID: '1',
      name: 'Runner Pro',
      __queryID: 'q2',
    });
  });

  test('is idempotent, so re-merging the same records changes nothing', () => {
    const store = createChatRecordsStore();
    const records = [{ objectID: '1', name: 'Runner' }];

    store.merge(records);
    store.merge(records);

    expect(store.getAll()).toEqual({ 1: { objectID: '1', name: 'Runner' } });
  });

  test('skips records without a usable objectID', () => {
    const store = createChatRecordsStore();

    store.merge([
      { objectID: '1', name: 'Runner' },
      { objectID: '' },
      null,
      undefined,
      { name: 'No ID' } as unknown as ChatRecord,
    ]);

    expect(store.getAll()).toEqual({ 1: { objectID: '1', name: 'Runner' } });
  });

  test('starts empty, with no inherited keys', () => {
    const records = createChatRecordsStore().getAll();

    expect(records).toEqual({});
    expect(records.constructor).toBeUndefined();
    expect(records.__proto__).toBeUndefined();
  });

  test('stores prototype-named object IDs as own records', () => {
    const constructorRecord = {
      objectID: 'constructor',
      name: 'Constructor record',
    };
    const protoRecord = { objectID: '__proto__', name: 'Prototype record' };
    const store = createChatRecordsStore();

    store.merge([constructorRecord, protoRecord]);
    const records = store.getAll();

    expect(Object.prototype.hasOwnProperty.call(records, 'constructor')).toBe(
      true
    );
    expect(Object.prototype.hasOwnProperty.call(records, '__proto__')).toBe(
      true
    );
    expect(store.get('constructor')).toEqual(constructorRecord);
    expect(store.get('__proto__')).toEqual(protoRecord);
    expect(store.has('toString')).toBe(false);
  });

  describe('clear', () => {
    test('drops every record but keeps collecting', () => {
      const store = createChatRecordsStore();

      store.merge([{ objectID: '1', name: 'Runner' }]);
      store.clear();

      expect(store.getAll()).toEqual({});
      expect(store.get('1')).toBeUndefined();

      store.merge([{ objectID: '2', name: 'Sneaker' }]);

      expect(store.get('2')).toEqual({ objectID: '2', name: 'Sneaker' });
    });

    test('leaves a map handed out earlier alone', () => {
      const store = createChatRecordsStore();

      store.merge([{ objectID: '1', name: 'Runner' }]);
      const before = store.getAll();

      store.clear();

      expect(before).toEqual({ 1: { objectID: '1', name: 'Runner' } });
      expect(store.getAll()).toEqual({});
    });
  });
});

describe('getHitsFromToolOutput', () => {
  test('reads the hits of a completed call', () => {
    expect(
      getHitsFromToolOutput(searchPart('search', [{ objectID: '1' }]))
    ).toEqual([{ objectID: '1' }]);
  });

  test('reads nothing from a call that has no hits yet', () => {
    expect(
      getHitsFromToolOutput({
        type: 'tool-algolia_search_index',
        toolCallId: 'search',
        state: 'input-available',
        input: { query: 'shoes' },
      } as ChatToolMessage)
    ).toBeUndefined();

    expect(
      getHitsFromToolOutput({
        type: 'tool-algolia_search_index',
        toolCallId: 'search',
        state: 'output-available',
        input: {},
        output: { status: 'success' },
      } as ChatToolMessage)
    ).toBeUndefined();
  });
});

describe('collectChatRecords', () => {
  test('combines the records of every tool call of the conversation', () => {
    const store = collectChatRecords(
      [
        assistantMessage('1', [
          searchPart('search-1', [{ objectID: '1', name: 'Runner' }]),
          searchPart('search-2', [{ objectID: '2', name: 'Sneaker' }]),
        ]),
        assistantMessage('2', [
          searchPart('search-3', [
            { objectID: '1', name: 'Runner Pro' },
            { objectID: '3', name: 'Trail' },
          ]),
        ]),
      ],
      searchTools
    );

    // Every call contributes, and the newest copy of a record wins.
    expect(store.getAll()).toEqual({
      1: { objectID: '1', name: 'Runner Pro' },
      2: { objectID: '2', name: 'Sneaker' },
      3: { objectID: '3', name: 'Trail' },
    });
  });

  test('resolves a record a tool of an earlier turn fetched', () => {
    const store = collectChatRecords(
      [
        assistantMessage('1', [
          searchPart('search', [{ objectID: '1', name: 'Runner' }]),
        ]),
        assistantMessage('2', [
          {
            type: 'tool-algolia_display_results',
            toolCallId: 'display',
            state: 'output-available',
            input: { groups: [{ results: [{ objectID: '1' }] }] },
            output: {},
          },
        ]),
      ],
      searchTools
    );

    expect(store.get('1')).toEqual({ objectID: '1', name: 'Runner' });
  });

  test('asks each call its own tool, so a tool without getRecords contributes nothing', () => {
    const store = collectChatRecords(
      [
        assistantMessage('1', [
          { type: 'text', text: 'Here you go' },
          // Holds hits, but its tool declares no `getRecords`.
          searchPart('other', [{ objectID: 'ignored' }], 'tool-other_tool'),
          searchPart('search', [{ objectID: '1', name: 'Runner' }]),
        ]),
      ],
      { ...searchTools, other_tool: {} }
    );

    expect(store.getAll()).toEqual({ 1: { objectID: '1', name: 'Runner' } });
  });

  test('matches the Algolia MCP Server tool name shim', () => {
    const store = collectChatRecords(
      [
        assistantMessage('1', [
          searchPart(
            'search',
            [{ objectID: '1', name: 'Runner' }],
            'tool-algolia_search_index_products'
          ),
        ]),
      ],
      searchTools
    );

    expect(store.get('1')).toEqual({ objectID: '1', name: 'Runner' });
  });

  test('lets any tool contribute its own records', () => {
    // A tool of one's own, publishing records from a shape of its own.
    const getRecords: ChatToolRecordsGetter = (part) =>
      part.state === 'output-available'
        ? (part.output as { products?: Array<{ objectID: string }> }).products
        : undefined;
    const store = collectChatRecords(
      [
        assistantMessage('1', [
          {
            type: 'tool-my_catalog',
            toolCallId: 'catalog',
            state: 'output-available',
            input: {},
            output: { products: [{ objectID: '1', name: 'Runner' }] },
          },
        ]),
      ],
      { my_catalog: { getRecords } }
    );

    expect(store.get('1')).toEqual({ objectID: '1', name: 'Runner' });
  });

  test('merges into a store it is given, across repeated collections', () => {
    const store = createChatRecordsStore();
    const first = assistantMessage('1', [
      searchPart('search-1', [{ objectID: '1', name: 'Runner' }]),
    ]);

    expect(collectChatRecords([first], searchTools, store)).toBe(store);

    // A later turn's records join the same store.
    collectChatRecords(
      [
        first,
        assistantMessage('2', [
          searchPart('search-2', [{ objectID: '2', name: 'Sneaker' }]),
        ]),
      ],
      searchTools,
      store
    );

    expect(store.getAll()).toEqual({
      1: { objectID: '1', name: 'Runner' },
      2: { objectID: '2', name: 'Sneaker' },
    });
  });

  test('keeps records of a message that is no longer in the conversation', () => {
    // A regenerated turn drops its search call; anything still referring to that
    // record resolves until a newer call replaces it.
    const store = createChatRecordsStore();

    collectChatRecords(
      [
        assistantMessage('1', [
          searchPart('search', [{ objectID: '1', name: 'Runner' }]),
        ]),
      ],
      searchTools,
      store
    );
    collectChatRecords(
      [assistantMessage('1', [{ type: 'text', text: 'Redone' }])],
      searchTools,
      store
    );

    expect(store.get('1')).toEqual({ objectID: '1', name: 'Runner' });
  });

  test('collects a conversation restored from storage', () => {
    // The rehydration path: the same collection over restored messages resolves
    // the records the session that produced them did.
    const restored = JSON.parse(
      JSON.stringify([
        assistantMessage('1', [
          searchPart('search', [{ objectID: '1', name: 'Runner' }]),
        ]),
      ])
    ) as ChatMessageBase[];

    expect(collectChatRecords(restored, searchTools).get('1')).toEqual({
      objectID: '1',
      name: 'Runner',
    });
  });

  test('handles a missing conversation', () => {
    expect(collectChatRecords(undefined, searchTools).getAll()).toEqual({});
  });
});
