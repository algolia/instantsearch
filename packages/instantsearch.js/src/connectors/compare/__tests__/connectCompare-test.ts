/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from '../../../../test/createWidget';
import connectCompare, {
  type CompareConnectorParams,
  getComparisonPlaceholderMessage,
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

  describe('shared configuration', () => {
    function setupPair(barParams: CompareConnectorParams) {
      const chatRenderState = createChatRenderState();
      const initOptions = createInitOptions();
      const bar = setup({
        initOptions,
        chatRenderState,
        widgetParams: barParams,
      });
      const toggle = setup({
        initOptions: createInitOptions({
          instantSearchInstance: initOptions.instantSearchInstance,
        }),
      });
      return { bar, toggle, chatRenderState };
    }

    it('shares the limits of the widget that configures them with widgets that set none', () => {
      const { toggle } = setupPair({ minItems: 2, maxItems: 4 });

      expect(toggle.getRenderState().maxItems).toBe(4);
      ['A', 'B', 'C', 'D', 'E'].forEach((objectID) =>
        toggle.getRenderState().addItem({ objectID })
      );

      expect(toggle.getRenderState().items).toHaveLength(4);
      expect(toggle.getRenderState().canAddItems).toBe(false);
    });

    it('uses the shared `minItems` for `canCompare` and `compare()`', () => {
      const { toggle, chatRenderState } = setupPair({
        configurationId: 'abc',
        minItems: 3,
        maxItems: 4,
      });

      toggle.getRenderState().addItem({ objectID: 'A' });
      toggle.getRenderState().addItem({ objectID: 'B' });
      expect(toggle.getRenderState().canCompare).toBe(false);
      expect(toggle.getRenderState().compare()).toBe(false);

      toggle.getRenderState().addItem({ objectID: 'C' });
      expect(toggle.getRenderState().canCompare).toBe(true);
      expect(toggle.getRenderState().compare()).toBe(true);
      expect(chatRenderState.sendMessage).toHaveBeenCalledTimes(1);
    });

    it('falls back to 2 and 3 when no widget sets limits', () => {
      const { toggle } = setupPair({});

      expect(toggle.getRenderState().minItems).toBe(2);
      expect(toggle.getRenderState().maxItems).toBe(3);
    });

    it('drops the configuration of a widget when it is disposed', () => {
      const { bar, toggle } = setupPair({
        configurationId: 'abc',
        minItems: 2,
        maxItems: 5,
      });
      toggle.getRenderState().addItem({ objectID: 'A' });
      toggle.getRenderState().addItem({ objectID: 'B' });

      bar.widget.dispose!(createDisposeOptions());

      expect(toggle.getRenderState().maxItems).toBe(3);
      expect(() => toggle.getRenderState().compare()).toThrow(
        /`configurationId` option is required/
      );
    });

    it('keeps the selection when a toggle is disposed', () => {
      const { toggle } = setupPair({ configurationId: 'abc' });
      toggle.getRenderState().addItem({ objectID: 'A' });

      toggle.widget.dispose!(createDisposeOptions());

      const remount = setup({ initOptions: toggle.initOptions });
      expect(remount.getRenderState().items).toEqual([{ objectID: 'A' }]);
    });

    it('falls back to the remaining widget when one of two bars is disposed', () => {
      const initOptions = createInitOptions();
      const first = setup({
        initOptions,
        widgetParams: { configurationId: 'first' },
      });
      const second = setup({
        initOptions: createInitOptions({
          instantSearchInstance: initOptions.instantSearchInstance,
        }),
        widgetParams: { configurationId: 'second' },
      });

      second.widget.dispose!(createDisposeOptions());
      second.initOptions.instantSearchInstance.renderState = {};

      first.getRenderState().addItem({ objectID: 'A' });
      first.getRenderState().addItem({ objectID: 'B' });
      // still configured (by the first bar): no usage error
      expect(() => first.getRenderState().compare()).not.toThrow();
    });

    it('warns when two widgets set a different value', () => {
      const initOptions = createInitOptions();
      setup({ initOptions, widgetParams: { maxItems: 4 } });

      expect(() =>
        setup({
          initOptions: createInitOptions({
            instantSearchInstance: initOptions.instantSearchInstance,
          }),
          widgetParams: { maxItems: 5 },
        })
      ).toWarnDev(
        `[InstantSearch.js]: Several \`compare\` widgets set a different \`maxItems\` (4 and 5). The selection is shared, so set it on a single widget (the \`compareBar\`); the last one mounted is used.

See documentation: https://www.algolia.com/doc/api-reference/widgets/compare/js/#connector`
      );
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
