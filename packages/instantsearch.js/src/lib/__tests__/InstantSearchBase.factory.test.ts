/**
 * @jest-environment jsdom
 */
import { createSearchClient } from '@instantsearch/mocks';

import connectChat from '../../connectors/chat/connectChat';
import { createInsightsMiddleware } from '../../middlewares/createInsightsMiddleware';
import chat from '../../widgets/chat/chat';
import chatTrigger from '../../widgets/chat-trigger/chat-trigger';
import { instantsearchBase } from '../InstantSearchBase';
import { getAppIdAndApiKey } from '../utils';

import type { Middleware, Widget } from '../../types';

describe('instantsearchBase', () => {
  test('mounts chat and chatTrigger without instantsearch()', async () => {
    const chatContainer = document.createElement('div');
    const triggerContainer = document.createElement('div');
    document.body.append(chatContainer, triggerContainer);

    const base = instantsearchBase({
      searchClient: { appId: 'app', apiKey: 'key' },
    });
    base
      .addWidgets([
        chat({
          container: chatContainer,
          agentId: 'agent',
          requiresSearch: false,
          disableTriggerValidation: true,
        }),
        chatTrigger({ container: triggerContainer }),
      ])
      .start();

    const button = triggerContainer.querySelector('button')!;
    expect(chatContainer.querySelector('.ais-Chat-container--open')).toBeNull();
    expect(button.classList).not.toContain('ais-ChatToggleButton--open');

    button.click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    // The trigger found the chat through the base's shared render state,
    // opened it, and re-rendered itself from the chat's new state.
    expect(
      chatContainer.querySelector('.ais-Chat-container--open')
    ).not.toBeNull();
    expect(button.classList).toContain('ais-ChatToggleButton--open');

    base.dispose();
  });

  describe('insights', () => {
    function setup() {
      const insightsClient: any = jest.fn((method: string, ...args: any[]) => {
        if (method === 'getUserToken') {
          args[1](null, undefined);
        }
      });
      insightsClient.version = '2.17.2';

      let renderState: any;
      const widget = connectChat(
        (state) => {
          renderState = state;
        },
        () => {}
      )({
        agentId: 'agent',
        requiresSearch: false,
        disableTriggerValidation: true,
      });
      const base = instantsearchBase({
        searchClient: { appId: 'app', apiKey: 'key' },
        indexName: 'products',
      });

      return {
        insightsClient,
        base,
        widget,
        getRenderState: () => renderState,
      };
    }

    const hit = { objectID: 'p1', __position: 1, __queryID: 'q1' };

    test('drops events without the insights middleware', () => {
      const { base, widget, insightsClient, getRenderState } = setup();
      base.addWidgets([widget]).start();

      expect(() =>
        getRenderState().sendEvent('click', hit, 'Product Clicked')
      ).not.toThrow();
      expect(insightsClient).not.toHaveBeenCalledWith(
        'clickedObjectIDsAfterSearch',
        expect.anything(),
        expect.anything()
      );
    });

    test('sends events through the regular insights middleware', () => {
      const { base, widget, insightsClient, getRenderState } = setup();
      base
        .use(createInsightsMiddleware({ insightsClient }))
        .addWidgets([widget])
        .start();

      getRenderState().sendEvent('click', hit, 'Product Clicked');

      expect(insightsClient).toHaveBeenCalledWith(
        'clickedObjectIDsAfterSearch',
        expect.objectContaining({
          index: 'products',
          eventName: 'Product Clicked',
          objectIDs: ['p1'],
          positions: [1],
          queryID: 'q1',
        }),
        {
          headers: expect.objectContaining({
            'X-Algolia-Application-Id': 'app',
          }),
        }
      );
    });

    test('stops sending events once the middleware is removed', () => {
      const { base, widget, insightsClient, getRenderState } = setup();
      const middleware = createInsightsMiddleware({ insightsClient });
      base.use(middleware).addWidgets([widget]).start();
      base.unuse(middleware);
      insightsClient.mockClear();

      getRenderState().sendEvent('click', hit, 'Product Clicked');

      expect(insightsClient).not.toHaveBeenCalledWith(
        'clickedObjectIDsAfterSearch',
        expect.anything(),
        expect.anything()
      );
    });
  });

  describe('credentials', () => {
    function captureClient(options: Parameters<typeof instantsearchBase>[0]) {
      let client: unknown;
      const widget: Widget = {
        $$type: 'test.capture',
        init({ instantSearchInstance }) {
          client = instantSearchInstance.client;
        },
      };
      instantsearchBase(options).addWidgets([widget]).start();

      return client;
    }

    test('are read from a search client, which is never used to search', () => {
      const searchClient = createSearchClient();

      const client = captureClient({ searchClient });

      expect(client).toBe(searchClient);
      expect(getAppIdAndApiKey(client)).toEqual(['appId', 'apiKey']);
      expect(searchClient.search).not.toHaveBeenCalled();
    });

    test('can be given as an app ID and API key', () => {
      const client = captureClient({
        searchClient: { appId: 'myApp', apiKey: 'myKey' },
      });

      expect(getAppIdAndApiKey(client)).toEqual(['myApp', 'myKey']);
    });
  });

  describe('middleware', () => {
    function createRecordingMiddleware() {
      const calls: string[] = [];
      const middleware: Middleware = () => ({
        $$type: 'recording',
        subscribe() {
          calls.push('subscribe');
        },
        started() {
          calls.push('started');
        },
        unsubscribe() {
          calls.push('unsubscribe');
        },
        onStateChange() {},
      });

      return { calls, middleware };
    }

    test('follows the lifecycle of the base', () => {
      const { calls, middleware } = createRecordingMiddleware();
      const base = instantsearchBase({
        searchClient: { appId: 'app', apiKey: 'key' },
      });

      base.use(middleware);
      expect(calls).toEqual([]);

      base.start();
      expect(calls).toEqual(['subscribe', 'started']);

      base.dispose();
      expect(calls).toEqual(['subscribe', 'started', 'unsubscribe']);
    });

    test('is subscribed right away when added after the base started', () => {
      const { calls, middleware } = createRecordingMiddleware();
      const base = instantsearchBase({
        searchClient: { appId: 'app', apiKey: 'key' },
      });

      base.start();
      base.use(middleware);
      expect(calls).toEqual(['subscribe', 'started']);

      base.unuse(middleware);
      expect(calls).toEqual(['subscribe', 'started', 'unsubscribe']);
    });
  });

  describe('main index', () => {
    function createWidget(name: string, calls: string[]): Widget {
      return {
        $$type: `test.${name}`,
        init() {
          calls.push(`${name}:init`);
        },
        render() {
          calls.push(`${name}:render`);
        },
        dispose() {
          calls.push(`${name}:dispose`);
        },
      };
    }

    // Renders are scheduled, like on an index.
    const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

    test('adds, replaces and removes widgets like an index', async () => {
      const calls: string[] = [];
      const first = createWidget('first', calls);
      const second = createWidget('second', calls);
      const base = instantsearchBase({
        searchClient: { appId: 'app', apiKey: 'key' },
        indexName: 'indexName',
      }) as any;

      base.start();
      base.mainIndex.addWidgets([first]);
      await flush();
      expect(base.mainIndex.getWidgets()).toEqual([first]);
      expect(calls).toEqual(['first:init', 'first:render']);

      base.mainIndex.updateWidget(first, second);
      await flush();
      expect(base.mainIndex.getWidgets()).toEqual([second]);
      expect(calls).toEqual([
        'first:init',
        'first:render',
        'first:dispose',
        'second:init',
        'second:render',
      ]);

      base.mainIndex.removeWidgets([second]);
      expect(base.mainIndex.getWidgets()).toEqual([]);
      expect(calls.slice(-1)).toEqual(['second:dispose']);
    });

    test('exposes what the hooks read without searching', () => {
      const base = instantsearchBase({
        searchClient: { appId: 'app', apiKey: 'key' },
        indexName: 'indexName',
      }) as any;

      base.start();

      expect(base.mainIndex.getIndexId()).toBe('instantSearchBase');
      expect(base.mainIndex.getIndexName()).toBe('indexName');
      expect(base.mainIndex.getHelper().state.index).toBe('indexName');
      expect(base.mainIndex.getScopedResults()).toEqual([]);
      expect(base.status).toBe('idle');
      expect(base.getUiState()).toEqual({ instantSearchBase: {} });
    });

    test('notifies listeners after each render', async () => {
      const base = instantsearchBase({
        searchClient: { appId: 'app', apiKey: 'key' },
      }) as any;
      const onRender = jest.fn();

      base.addListener('render', onRender);
      base.start();
      await flush();
      expect(onRender).toHaveBeenCalledTimes(1);

      base.removeListener('render', onRender);
      base.addWidgets([createWidget('late', [])]);
      await flush();
      expect(onRender).toHaveBeenCalledTimes(1);
    });
  });
});
