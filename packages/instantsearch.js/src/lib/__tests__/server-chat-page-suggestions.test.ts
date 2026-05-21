/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import {
  createControlledSearchClient,
  createSearchClient,
} from '@instantsearch/mocks';

import { connectSearchBox } from '../../connectors';
import connectChatPageSuggestions from '../../connectors/chat-page-suggestions/connectChatPageSuggestions';
import instantsearch from '../../index.es';
import { Chat } from '../chat';
import { waitForResults } from '../server';

import type { ChatTransport, UIMessage } from '../ai-lite';

function createMockTransport(
  opts: {
    delayMs?: number;
    controllerSpy?: (ctrl: AbortSignal | undefined) => void;
  } = {}
): ChatTransport<UIMessage> {
  const { delayMs = 0, controllerSpy } = opts;
  return {
    sendMessages: jest.fn(({ abortSignal }) => {
      controllerSpy?.(abortSignal);
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          resolve(
            new ReadableStream({
              start(ctrl) {
                ctrl.close();
              },
            })
          );
        }, delayMs);
        if (abortSignal) {
          abortSignal.addEventListener('abort', () => {
            clearTimeout(timer);
            reject(new DOMException('aborted', 'AbortError'));
          });
        }
      });
    }) as ChatTransport<UIMessage>['sendMessages'],
    reconnectToStream: jest.fn(() => Promise.resolve(null)),
  };
}

describe('waitForResults — server-wait promises', () => {
  test('awaits promises registered via registerServerWait before resolving', async () => {
    const { searchClient, searches } = createControlledSearchClient();
    const search = instantsearch({
      indexName: 'indexName',
      searchClient,
    }).addWidgets([connectSearchBox(() => {})({})]);

    search.start();

    let registeredResolve: () => void = () => {};
    search.registerServerWait(
      new Promise<void>((resolve) => {
        registeredResolve = resolve;
      })
    );

    const output = waitForResults(search);

    // Resolve the search before the registered promise.
    searches[0].resolver();

    // The waitForResults promise should be pending until the registered
    // promise also resolves.
    const wasFinished = await Promise.race([
      output.then(() => true),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 50)),
    ]);
    expect(wasFinished).toBe(false);

    // Now resolve the registered promise; waitForResults should finish.
    registeredResolve();
    await expect(output).resolves.toBeDefined();
  });

  test('does not crash when a registered promise rejects', async () => {
    const { searchClient, searches } = createControlledSearchClient();
    const search = instantsearch({
      indexName: 'indexName',
      searchClient,
    }).addWidgets([connectSearchBox(() => {})({})]);

    search.start();

    search.registerServerWait(Promise.reject(new Error('agent down')));

    const output = waitForResults(search);
    searches[0].resolver();

    await expect(output).resolves.toBeDefined();
  });
});

describe('connectChatPageSuggestions — SSR race', () => {
  // The connector branches on `typeof window === 'undefined'`. jsdom defines
  // `window`, so monkey-patch the typeof check by deleting `globalThis.window`
  // for the duration of each test.
  const originalWindow = globalThis.window;

  beforeEach(() => {
    // Drop sessionStorage that Chat persists across instances under a
    // shared key — otherwise prior tests' state leaks into this one.
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete (globalThis as { window?: Window }).window;
  });
  afterEach(() => {
    (globalThis as { window?: Window }).window = originalWindow;
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
  });

  test('aborts the agent request when the SSR timeout fires', async () => {
    let capturedSignal: AbortSignal | undefined;
    const transport = createMockTransport({
      delayMs: 5000,
      controllerSpy: (signal) => {
        capturedSignal = signal;
      },
    });

    const chatInstance = new Chat<UIMessage>({
      id: 'test-fast-timeout',
      transport,
    });
    const stopSpy = jest.spyOn(chatInstance, 'stop');

    const search = instantsearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
    });
    const widget = connectChatPageSuggestions(() => {})({
      chat: chatInstance,
      initialUserMessage: 'help',
      ssrTimeoutMs: 30,
    });
    search.addWidgets([connectSearchBox(() => {})({}), widget]);
    search.start();

    const start = Date.now();
    const wait = waitForResults(search);

    const promises = (
      search as unknown as {
        _serverWaitPromises: Array<Promise<unknown>>;
      }
    )._serverWaitPromises;
    expect(promises.length).toBeGreaterThanOrEqual(1);

    // Let the SSR pipeline settle. The chat promise resolves at ssrTimeoutMs,
    // and we resolve the search soon after to let waitForResults complete.
    await new Promise((r) => setTimeout(r, 50));
    // Stop the chat-page-suggestions race promise: it should already be
    // resolved by the timeout. Verify chat.stop was called.
    expect(stopSpy).toHaveBeenCalled();
    expect(capturedSignal).toBeDefined();

    // Resolve the search side so waitForResults can finish.
    // (createSearchClient returns immediately, but we need to await the next
    // microtask cycle.)
    await wait;

    expect(Date.now() - start).toBeLessThan(500);
  });

  test('reuses the same in-flight promise across two SSR passes', async () => {
    const transport = createMockTransport({ delayMs: 1000 });
    const chatInstance = new Chat<UIMessage>({
      id: 'test-two-pass',
      transport,
    });
    const sendMessagesSpy = transport.sendMessages as jest.Mock;

    const search = instantsearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
    });
    const widget = connectChatPageSuggestions(() => {})({
      chat: chatInstance,
      initialUserMessage: 'help',
      ssrTimeoutMs: 50,
    });
    search.addWidgets([connectSearchBox(() => {})({}), widget]);
    search.start();

    // sendMessage is async — let microtasks flush so transport.sendMessages
    // is invoked before we assert.
    await new Promise((r) => setTimeout(r, 20));

    // The widget fired its initial request: assert via the transport spy
    // (which sits below the sendMessage wrapper).
    expect(sendMessagesSpy).toHaveBeenCalled();
    const transportCallsAfterFirstInit = sendMessagesSpy.mock.calls.length;
    const messagesAfterFirstInit = chatInstance.messages.length;

    const promises = (
      search as unknown as {
        _serverWaitPromises: Array<Promise<unknown>>;
      }
    )._serverWaitPromises;
    expect(promises.length).toBeGreaterThanOrEqual(1);
    const firstPassPromise = promises[promises.length - 1];

    // Simulate the start of a second SSR pass: drain the registered list (as
    // waitForResults would after round one) and re-init the widget.
    search.consumeServerWaitPromises();

    const helper = search.helper!;
    widget.init!({
      helper,
      state: helper.state,
      instantSearchInstance: search,
      // @ts-ignore - test helper, IndexWidget shape
      parent: search.mainIndex,
      uiState: {},
      // eslint-disable-next-line no-undef-init
      results: undefined,
      // @ts-ignore - test helper
      templatesConfig: search.templatesConfig,
      // @ts-ignore - test helper
      renderState: {},
      // @ts-ignore - test helper
      createURL: () => '',
    });

    // The transport must NOT be hit a second time — the in-flight request is
    // reused (idempotency flag on the chat instance).
    expect(sendMessagesSpy.mock.calls.length).toBe(
      transportCallsAfterFirstInit
    );
    expect(chatInstance.messages.length).toBe(messagesAfterFirstInit);

    // And the SAME race promise must be re-registered (object-identity
    // check confirms it came from the cached `__chatPageSuggestionsServerWait`
    // on the chat instance, not a fresh one).
    const promisesAfter = (
      search as unknown as {
        _serverWaitPromises: Array<Promise<unknown>>;
      }
    )._serverWaitPromises;
    expect(promisesAfter[promisesAfter.length - 1]).toBe(firstPassPromise);
  });
});
