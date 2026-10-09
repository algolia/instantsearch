/**
 * @jest-environment jsdom
 */
import { createSearchClient } from '@instantsearch/mocks';

import connectHits from '../../connectors/hits/connectHits';
import chat from '../../widgets/chat/chat';
import chatTrigger from '../../widgets/chat-trigger/chat-trigger';
import { createWidgetContainer } from '../createWidgetContainer';
import { InstantSearchBase } from '../InstantSearchBase';
import { InstantSearchWithSearch } from '../InstantSearchWithSearch';

import type { Middleware } from '../../types';

describe('InstantSearchBase', () => {
  // Everything is added by hand: the base brings the lifecycle, the container
  // brings a root for the widgets, and nothing else is imported. In particular
  // there is no search helper, no routing and no index tree.
  function createBase() {
    return new InstantSearchBase({
      client: { appId: 'app', apiKey: 'key' },
      indexName: 'indexName',
      mainIndex: createWidgetContainer({
        indexId: 'indexName',
        indexName: 'indexName',
      }),
    });
  }

  test('hosts chat and chatTrigger', async () => {
    const chatContainer = document.createElement('div');
    const triggerContainer = document.createElement('div');
    document.body.append(chatContainer, triggerContainer);

    const base = createBase();
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
    await new Promise((resolve) => setTimeout(resolve, 0));

    const button = triggerContainer.querySelector('button')!;
    expect(chatContainer.querySelector('.ais-Chat-container--open')).toBeNull();

    button.click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(
      chatContainer.querySelector('.ais-Chat-container--open')
    ).not.toBeNull();

    base.dispose();
    expect(base.started).toBe(false);
  });

  test('runs the middleware lifecycle of the modules that are added', () => {
    const calls: string[] = [];
    const recording: Middleware = () => ({
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

    const base = createBase().use(recording);
    base.start();
    base.dispose();

    expect(calls).toEqual(['subscribe', 'started', 'unsubscribe']);
  });

  test('has the defaults widgets read from an instance that never searches', () => {
    const base = createBase();
    base.start();

    expect(base.status).toBe('idle');
    expect(base.error).toBeUndefined();
    expect(base.getUiState()).toEqual({ indexName: {} });
    expect(base.mainHelper!.state.index).toBe('indexName');

    base.dispose();
  });

  test('searches when the search side is added, without routing or Insights', async () => {
    const searchClient = createSearchClient();
    const render = jest.fn();

    const search = new InstantSearchWithSearch({
      indexName: 'indexName',
      searchClient,
    });
    search.addWidgets([connectHits(render)({})]);
    search.start();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(searchClient.search).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenCalled();
    expect(search.status).toBe('idle');
    expect(search.getUiState()).toEqual({ indexName: {} });

    search.dispose();
  });
});
