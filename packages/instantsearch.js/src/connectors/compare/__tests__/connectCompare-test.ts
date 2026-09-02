/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from '../../../../test/createWidget';
import connectCompare, {
  getComparisonPlaceholderMessage,
  getDefaultComparisonMessage,
} from '../connectCompare';

import type { ChatRenderState } from '../../chat/connectChat';

function createChatRenderState(
  overrides: Partial<ChatRenderState> = {}
): Partial<ChatRenderState> {
  return {
    open: false,
    status: 'ready' as ChatRenderState['status'],
    setOpen: jest.fn(),
    focusInput: jest.fn(),
    sendMessage: jest.fn(),
    ...overrides,
  };
}

/**
 * Mounts a `compare` widget and returns its latest render state. The chat
 * render state (if provided) is injected into the shared
 * `instantSearchInstance.renderState`, exactly where the connector reads its
 * sibling `chat` widget from.
 */
function setup({
  widgetParams = {},
  chatRenderState,
  initOptions = createInitOptions(),
}: {
  widgetParams?: Parameters<ReturnType<typeof connectCompare>>[0];
  chatRenderState?: Partial<ChatRenderState>;
  initOptions?: ReturnType<typeof createInitOptions>;
} = {}) {
  const renderFn = jest.fn();
  const widget = connectCompare(renderFn)(widgetParams);

  if (chatRenderState) {
    const indexId = initOptions.parent.getIndexId();
    initOptions.instantSearchInstance.renderState[indexId] = {
      chat: chatRenderState,
    } as unknown as (typeof initOptions.instantSearchInstance.renderState)[string];
  }

  widget.init!(initOptions);

  const getRenderState = () =>
    renderFn.mock.calls[renderFn.mock.calls.length - 1][0];

  return { widget, renderFn, getRenderState, initOptions };
}

describe('connectCompare', () => {
  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        // @ts-expect-error
        connectCompare()({});
      }).toThrow(/The render function is not valid/);
    });

    it('throws when `minItems` is lower than 2', () => {
      expect(() => {
        connectCompare(() => {})({ minItems: 1 });
      }).toThrow(/The `minItems` option must be at least 2/);
    });

    it('throws when `maxItems` is lower than `minItems`', () => {
      expect(() => {
        connectCompare(() => {})({ minItems: 3, maxItems: 2 });
      }).toThrow(/The `maxItems` option must be greater than `minItems`/);
    });

    it('is a widget', () => {
      const widget = connectCompare(() => {})({});

      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.compare',
          opensChat: true,
          init: expect.any(Function),
          render: expect.any(Function),
          dispose: expect.any(Function),
        })
      );
    });
  });

  describe('selection', () => {
    it('starts with an empty selection and the resolved limits', () => {
      const { getRenderState } = setup();

      expect(getRenderState()).toEqual(
        expect.objectContaining({
          items: [],
          canAddItems: true,
          canCompare: false,
          minItems: 2,
          maxItems: 3,
        })
      );
    });

    it('adds, toggles and removes items by objectID', () => {
      const { getRenderState } = setup();

      getRenderState().addItem({ objectID: 'A', name: 'MacBook Pro 14' });
      getRenderState().toggleItem({ objectID: 'B', name: 'MacBook Pro 16' });

      expect(getRenderState().items).toEqual([
        { objectID: 'A', name: 'MacBook Pro 14' },
        { objectID: 'B', name: 'MacBook Pro 16' },
      ]);
      expect(getRenderState().isSelected('A')).toBe(true);
      expect(getRenderState().canCompare).toBe(true);

      getRenderState().toggleItem({ objectID: 'A' });
      expect(getRenderState().items).toEqual([
        { objectID: 'B', name: 'MacBook Pro 16' },
      ]);

      getRenderState().removeItem('B');
      expect(getRenderState().items).toEqual([]);
    });

    it('ignores duplicates and additions beyond `maxItems`', () => {
      const { getRenderState } = setup({ widgetParams: { maxItems: 2 } });

      getRenderState().addItem({ objectID: 'A' });
      getRenderState().addItem({ objectID: 'A' });
      getRenderState().addItem({ objectID: 'B' });
      getRenderState().addItem({ objectID: 'C' });

      expect(getRenderState().items.map((item: any) => item.objectID)).toEqual([
        'A',
        'B',
      ]);
      expect(getRenderState().canAddItems).toBe(false);
    });

    it('clears the whole selection', () => {
      const { getRenderState } = setup();

      getRenderState().addItem({ objectID: 'A' });
      getRenderState().addItem({ objectID: 'B' });
      getRenderState().clearItems();

      expect(getRenderState().items).toEqual([]);
    });

    it('re-renders after every mutation', () => {
      const { getRenderState, renderFn } = setup();
      const callsAfterInit = renderFn.mock.calls.length;

      getRenderState().addItem({ objectID: 'A' });

      expect(renderFn.mock.calls.length).toBeGreaterThan(callsAfterInit);
      expect(renderFn).toHaveBeenLastCalledWith(
        expect.objectContaining({
          items: [{ objectID: 'A' }],
        }),
        false
      );
    });

    it('shares the selection between widgets of the same instance', () => {
      const initOptions = createInitOptions();
      const first = setup({ initOptions });
      const second = setup({
        initOptions: createInitOptions({
          instantSearchInstance: initOptions.instantSearchInstance,
        }),
      });

      first.getRenderState().addItem({ objectID: 'A' });

      expect(second.getRenderState().items).toEqual([{ objectID: 'A' }]);
      // The other widget was notified and re-rendered with the new selection.
      expect(second.renderFn).toHaveBeenLastCalledWith(
        expect.objectContaining({ items: [{ objectID: 'A' }] }),
        false
      );
    });

    it('does not share the selection across instances', () => {
      const first = setup();
      const second = setup();

      first.getRenderState().addItem({ objectID: 'A' });

      expect(second.getRenderState().items).toEqual([]);
    });

    it('stops notifying a disposed widget', () => {
      const initOptions = createInitOptions();
      const first = setup({ initOptions });
      const second = setup({
        initOptions: createInitOptions({
          instantSearchInstance: initOptions.instantSearchInstance,
        }),
      });

      second.widget.dispose!(createDisposeOptions());
      const callsAfterDispose = second.renderFn.mock.calls.length;

      first.getRenderState().addItem({ objectID: 'A' });

      expect(second.renderFn.mock.calls.length).toBe(callsAfterDispose);
    });
  });

  describe('compare', () => {
    it('opens the chat and sends the default comparison message', () => {
      const chatRenderState = createChatRenderState();
      const { getRenderState } = setup({ chatRenderState });

      getRenderState().addItem({ objectID: 'A', name: 'MacBook Pro 14' });
      getRenderState().addItem({ objectID: 'B', name: 'MacBook Pro 16' });

      const sent = getRenderState().compare();

      expect(sent).toBe(true);
      expect(chatRenderState.setOpen).toHaveBeenCalledWith(true);
      expect(chatRenderState.sendMessage).toHaveBeenCalledWith(
        {
          text: 'Compare these products: "MacBook Pro 14" (objectID: A) vs "MacBook Pro 16" (objectID: B)',
          metadata: {
            turnContext: {
              selected_products: JSON.stringify([
                { objectID: 'A', name: 'MacBook Pro 14' },
                { objectID: 'B', name: 'MacBook Pro 16' },
              ]),
            },
          },
        },
        { headers: { 'x-algolia-referer': 'compare' } }
      );
    });

    it('sends the configuration placeholder when `configurationId` is set', () => {
      const chatRenderState = createChatRenderState();
      const { getRenderState } = setup({
        chatRenderState,
        widgetParams: { configurationId: 'algolia_comparison_abc' },
      });

      getRenderState().addItem({ objectID: 'A', name: 'MacBook Pro 14' });
      getRenderState().addItem({ objectID: 'B', name: 'MacBook Pro 16' });
      getRenderState().compare();

      expect(chatRenderState.sendMessage).toHaveBeenCalledWith(
        {
          text: '__INSTANTSEARCH_COMPARISON_algolia_comparison_abc__',
          metadata: {
            turnContext: {
              selected_products: JSON.stringify([
                { objectID: 'A', name: 'MacBook Pro 14' },
                { objectID: 'B', name: 'MacBook Pro 16' },
              ]),
              comparison_configuration_id: 'algolia_comparison_abc',
            },
          },
        },
        { headers: { 'x-algolia-referer': 'compare' } }
      );
    });

    it('strips `_`-prefixed internal metadata from `selected_products`', () => {
      const chatRenderState = createChatRenderState();
      const { getRenderState } = setup({ chatRenderState });

      getRenderState().addItem({
        objectID: 'A',
        name: 'MacBook Pro 14',
        _highlightResult: { name: {} },
        __position: 1,
      });
      getRenderState().addItem({ objectID: 'B' });
      getRenderState().compare();

      const [message] = (chatRenderState.sendMessage as jest.Mock).mock
        .calls[0];
      expect(
        JSON.parse(message.metadata.turnContext.selected_products)
      ).toEqual([{ objectID: 'A', name: 'MacBook Pro 14' }, { objectID: 'B' }]);
    });

    it('uses the `getComparisonMessage` option when provided', () => {
      const chatRenderState = createChatRenderState();
      const { getRenderState } = setup({
        chatRenderState,
        widgetParams: {
          getComparisonMessage: (items) =>
            `Which is better? ${items.map((i) => i.objectID).join(' or ')}`,
        },
      });

      getRenderState().addItem({ objectID: 'A' });
      getRenderState().addItem({ objectID: 'B' });
      getRenderState().compare();

      expect(chatRenderState.sendMessage).toHaveBeenCalledWith(
        {
          text: 'Which is better? A or B',
          metadata: {
            turnContext: {
              selected_products: JSON.stringify([
                { objectID: 'A' },
                { objectID: 'B' },
              ]),
            },
          },
        },
        { headers: { 'x-algolia-referer': 'compare' } }
      );
    });

    it('does nothing while fewer than `minItems` items are selected', () => {
      const chatRenderState = createChatRenderState();
      const { getRenderState } = setup({ chatRenderState });

      getRenderState().addItem({ objectID: 'A' });

      expect(getRenderState().compare()).toBe(false);
      expect(chatRenderState.setOpen).not.toHaveBeenCalled();
      expect(chatRenderState.sendMessage).not.toHaveBeenCalled();
    });

    it('returns false when no chat widget is mounted', () => {
      const { getRenderState } = setup();

      getRenderState().addItem({ objectID: 'A' });
      getRenderState().addItem({ objectID: 'B' });

      expect(getRenderState().compare()).toBe(false);
    });

    it('returns false when the chat is busy', () => {
      const chatRenderState = createChatRenderState({
        status: 'streaming' as ChatRenderState['status'],
      });
      const { getRenderState } = setup({ chatRenderState });

      getRenderState().addItem({ objectID: 'A' });
      getRenderState().addItem({ objectID: 'B' });

      expect(getRenderState().compare()).toBe(false);
      expect(chatRenderState.sendMessage).not.toHaveBeenCalled();
    });
  });

  describe('getRenderState', () => {
    it('exposes the render state under the `compare` key', () => {
      const { widget, initOptions } = setup();

      const renderState = widget.getRenderState(
        {},
        createRenderOptions({
          instantSearchInstance: initOptions.instantSearchInstance,
        })
      );

      expect(renderState.compare).toEqual(
        expect.objectContaining({
          items: [],
          canCompare: false,
          compare: expect.any(Function),
        })
      );
    });
  });

  describe('getComparisonPlaceholderMessage', () => {
    it('embeds the configuration id in the placeholder token', () => {
      expect(getComparisonPlaceholderMessage('algolia_comparison_abc')).toBe(
        '__INSTANTSEARCH_COMPARISON_algolia_comparison_abc__'
      );
    });
  });

  describe('getDefaultComparisonMessage', () => {
    it('names each item with its label and objectID', () => {
      expect(
        getDefaultComparisonMessage([
          { objectID: 'A', name: 'MacBook Pro 14' },
          { objectID: 'B', title: 'MacBook Pro 16' },
          { objectID: 'C' },
        ])
      ).toBe(
        'Compare these products: "MacBook Pro 14" (objectID: A) vs "MacBook Pro 16" (objectID: B) vs the product with objectID "C"'
      );
    });
  });
});
