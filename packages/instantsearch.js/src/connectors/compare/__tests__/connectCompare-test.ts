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
} from '../connectCompare';

import type { ChatRenderState } from '../../chat/connectChat';
import type { CompareItem } from '../connectCompare';

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

  describe('transformItems', () => {
    it('transforms `items` in the render state and passes `results` as metadata', () => {
      const transformItems = jest.fn((items: CompareItem[]) =>
        items.map((item) => ({ objectID: item.objectID }))
      );
      const { getRenderState } = setup({ widgetParams: { transformItems } });

      getRenderState().addItem({ objectID: 'A', name: 'A' });

      expect(getRenderState().items).toEqual([{ objectID: 'A' }]);
      expect(transformItems).toHaveBeenLastCalledWith(
        [{ objectID: 'A', name: 'A' }],
        { results: undefined }
      );
    });

    it('keeps selection, counts and limits on the raw items', () => {
      const { getRenderState } = setup({
        widgetParams: {
          maxItems: 2,
          transformItems: (items) =>
            items.map(({ objectID }) => ({ objectID: `t-${objectID}` })),
        },
      });

      getRenderState().addItem({ objectID: 'A' });
      expect(getRenderState().canCompare).toBe(false);
      getRenderState().addItem({ objectID: 'B' });

      expect(getRenderState().items).toEqual([
        { objectID: 't-A' },
        { objectID: 't-B' },
      ]);
      expect(getRenderState().isSelected('A')).toBe(true);
      expect(getRenderState().isSelected('t-A')).toBe(false);
      expect(getRenderState().canCompare).toBe(true);
      expect(getRenderState().canAddItems).toBe(false);

      getRenderState().removeItem('A');
      expect(getRenderState().items).toEqual([{ objectID: 't-B' }]);
    });
  });

  describe('compare', () => {
    const CONFIGURATION_ID = 'algolia_comparison_abc';
    const SENTINEL = '__ALGOLIA_COMPARISON_algolia_comparison_abc__';

    it('opens the chat and sends the configuration placeholder, marked as a pending prompt shortcut', () => {
      const chatRenderState = createChatRenderState();
      const { getRenderState } = setup({
        chatRenderState,
        widgetParams: { configurationId: CONFIGURATION_ID },
      });

      getRenderState().addItem({ objectID: 'A', name: 'MacBook Pro 14' });
      getRenderState().addItem({ objectID: 'B', name: 'MacBook Pro 16' });

      const sent = getRenderState().compare();

      expect(sent).toBe(true);
      expect(chatRenderState.setOpen).toHaveBeenCalledWith(true);
      expect(chatRenderState.sendMessage).toHaveBeenCalledWith(
        {
          text: SENTINEL,
          metadata: {
            turnContext: {
              selected_products: JSON.stringify([
                { objectID: 'A', name: 'MacBook Pro 14' },
                { objectID: 'B', name: 'MacBook Pro 16' },
              ]),
              comparison_configuration_id: CONFIGURATION_ID,
            },
            // The chat shows no bubble for the placeholder: the shopper goes
            // from the Compare button straight to the answer.
            promptShortcut: { sentinel: SENTINEL },
          },
        },
        { headers: { 'x-algolia-referer': 'compare' } }
      );
    });

    it('clears the selection once the comparison is sent, which dismisses the bar', () => {
      const chatRenderState = createChatRenderState();
      const { getRenderState } = setup({
        chatRenderState,
        widgetParams: { configurationId: CONFIGURATION_ID },
      });

      getRenderState().addItem({ objectID: 'A' });
      getRenderState().addItem({ objectID: 'B' });

      expect(getRenderState().compare()).toBe(true);
      expect(getRenderState().items).toEqual([]);
    });

    it('uses the `configurationId` another widget of the same instance set, so per-hit toggles can omit it', () => {
      const chatRenderState = createChatRenderState();
      const initOptions = createInitOptions();
      // The bar carries the configuration...
      setup({
        initOptions,
        chatRenderState,
        widgetParams: { configurationId: CONFIGURATION_ID },
      });
      // ...and a toggle without one still starts the comparison.
      const toggle = setup({
        initOptions: createInitOptions({
          instantSearchInstance: initOptions.instantSearchInstance,
        }),
      });

      toggle.getRenderState().addItem({ objectID: 'A' });
      toggle.getRenderState().addItem({ objectID: 'B' });

      expect(toggle.getRenderState().compare()).toBe(true);
      expect(chatRenderState.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({ text: SENTINEL }),
        { headers: { 'x-algolia-referer': 'compare' } }
      );
    });

    it('throws a usage error when no widget of the instance set a `configurationId`', () => {
      const chatRenderState = createChatRenderState();
      const { getRenderState } = setup({ chatRenderState });

      getRenderState().addItem({ objectID: 'A' });
      getRenderState().addItem({ objectID: 'B' });

      expect(() => getRenderState().compare())
        .toThrowErrorMatchingInlineSnapshot(`
        "The \`configurationId\` option is required to start a comparison. Set it on the \`compareBar\` widget to the ID of a comparison configuration created in the Agent Studio dashboard (Components > Comparison).

        See documentation: https://www.algolia.com/doc/api-reference/widgets/compare/js/#connector"
      `);
      expect(chatRenderState.sendMessage).not.toHaveBeenCalled();
    });

    it('strips `_`-prefixed internal metadata from `selected_products`', () => {
      const chatRenderState = createChatRenderState();
      const { getRenderState } = setup({
        chatRenderState,
        widgetParams: { configurationId: CONFIGURATION_ID },
      });

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

    it('sends the items transformed by `transformItems`, still stripping `_` keys', () => {
      const chatRenderState = createChatRenderState();
      const { getRenderState } = setup({
        chatRenderState,
        widgetParams: {
          configurationId: CONFIGURATION_ID,
          transformItems: (items) =>
            items.map(({ description, ...item }) => ({
              ...item,
              _internal: 'kept by the transform',
            })),
        },
      });

      getRenderState().addItem({ objectID: 'A', name: 'A', description: 'x' });
      getRenderState().addItem({ objectID: 'B', name: 'B', description: 'y' });
      getRenderState().compare();

      const [message] = (chatRenderState.sendMessage as jest.Mock).mock
        .calls[0];
      expect(
        JSON.parse(message.metadata.turnContext.selected_products)
      ).toEqual([
        { objectID: 'A', name: 'A' },
        { objectID: 'B', name: 'B' },
      ]);
    });

    it('uses the `transformItems` of the widget `compare()` is called from', () => {
      const chatRenderState = createChatRenderState();
      const initOptions = createInitOptions();
      const bar = setup({
        initOptions,
        chatRenderState,
        widgetParams: {
          configurationId: CONFIGURATION_ID,
          transformItems: (items) =>
            items.map(({ objectID }) => ({ objectID })),
        },
      });
      const toggle = setup({
        initOptions: createInitOptions({
          instantSearchInstance: initOptions.instantSearchInstance,
        }),
      });

      toggle.getRenderState().addItem({ objectID: 'A', name: 'A' });
      toggle.getRenderState().addItem({ objectID: 'B', name: 'B' });

      expect(toggle.getRenderState().items[0]).toEqual({
        objectID: 'A',
        name: 'A',
      });
      expect(bar.getRenderState().items[0]).toEqual({ objectID: 'A' });

      bar.getRenderState().compare();
      const [message] = (chatRenderState.sendMessage as jest.Mock).mock
        .calls[0];
      expect(
        JSON.parse(message.metadata.turnContext.selected_products)
      ).toEqual([{ objectID: 'A' }, { objectID: 'B' }]);
    });

    it('does nothing while fewer than `minItems` items are selected', () => {
      const chatRenderState = createChatRenderState();
      const { getRenderState } = setup({
        chatRenderState,
        widgetParams: { configurationId: CONFIGURATION_ID },
      });

      getRenderState().addItem({ objectID: 'A' });

      expect(getRenderState().compare()).toBe(false);
      expect(chatRenderState.setOpen).not.toHaveBeenCalled();
      expect(chatRenderState.sendMessage).not.toHaveBeenCalled();
    });

    it('returns false when no chat widget is mounted', () => {
      const { getRenderState } = setup({
        widgetParams: { configurationId: CONFIGURATION_ID },
      });

      getRenderState().addItem({ objectID: 'A' });
      getRenderState().addItem({ objectID: 'B' });

      expect(getRenderState().compare()).toBe(false);
    });

    it('returns false when the chat is busy', () => {
      const chatRenderState = createChatRenderState({
        status: 'streaming' as ChatRenderState['status'],
      });
      const { getRenderState } = setup({
        chatRenderState,
        widgetParams: { configurationId: CONFIGURATION_ID },
      });

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
        '__ALGOLIA_COMPARISON_algolia_comparison_abc__'
      );
    });
  });
});
