/**
 * @jest-environment jsdom
 */
import connectChat from '../../connectors/chat/connectChat';
import { createInsightsMiddleware } from '../../middlewares/createInsightsMiddleware';
import chat from '../../widgets/chat/chat';
import chatTrigger from '../../widgets/chat-trigger/chat-trigger';
import { createAlgoliaProvider } from '../AlgoliaProvider';

describe('createAlgoliaProvider', () => {
  test('mounts chat and chatTrigger without instantsearch()', async () => {
    const chatContainer = document.createElement('div');
    const triggerContainer = document.createElement('div');
    document.body.append(chatContainer, triggerContainer);

    const provider = createAlgoliaProvider({ appId: 'app', apiKey: 'key' });
    provider
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

    // The trigger found the chat through the provider's shared render state,
    // opened it, and re-rendered itself from the chat's new state.
    expect(
      chatContainer.querySelector('.ais-Chat-container--open')
    ).not.toBeNull();
    expect(button.classList).toContain('ais-ChatToggleButton--open');

    provider.dispose();
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
      const provider = createAlgoliaProvider({
        appId: 'app',
        apiKey: 'key',
        indexName: 'products',
      });

      return {
        insightsClient,
        provider,
        widget,
        getRenderState: () => renderState,
      };
    }

    const hit = { objectID: 'p1', __position: 1, __queryID: 'q1' };

    test('drops events without the insights middleware', () => {
      const { provider, widget, insightsClient, getRenderState } = setup();
      provider.addWidgets([widget]).start();

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
      const { provider, widget, insightsClient, getRenderState } = setup();
      provider
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
      const { provider, widget, insightsClient, getRenderState } = setup();
      const middleware = createInsightsMiddleware({ insightsClient });
      provider.use(middleware).addWidgets([widget]).start();
      provider.unuse(middleware);
      insightsClient.mockClear();

      getRenderState().sendEvent('click', hit, 'Product Clicked');

      expect(insightsClient).not.toHaveBeenCalledWith(
        'clickedObjectIDsAfterSearch',
        expect.anything(),
        expect.anything()
      );
    });
  });
});
