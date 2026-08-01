/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';
import { waitFor } from '@testing-library/dom';

import instantsearch from '../../../index.es';
import chat from '../chat';

// Replace the stick-to-bottom hook with a spy so we can assert the widget asks
// to scroll to the bottom while streaming. The real hook drives scrolling from
// a height-only ResizeObserver, which doesn't fire for content that grows
// horizontally (e.g. a carousel) — the effect under test is what re-pins on
// every message/status update instead.
jest.mock('../../../lib/useStickToBottom', () => {
  const scrollToBottom = jest.fn();
  return {
    __esModule: true,
    useStickToBottom: () => ({
      scrollRef: { current: null },
      contentRef: { current: null },
      scrollToBottom,
      isAtBottom: true,
    }),
    scrollToBottomSpy: scrollToBottom,
  };
});

const { scrollToBottomSpy }: { scrollToBottomSpy: jest.Mock } =
  jest.requireMock('../../../lib/useStickToBottom');

const STREAM = [
  '{"type":"start","messageId":"a1"}',
  '{"type":"start-step"}',
  '{"type":"text-start","id":"t1"}',
  '{"type":"text-delta","id":"t1","delta":"Hello"}',
  '{"type":"text-delta","id":"t1","delta":" world"}',
  '{"type":"text-end","id":"t1"}',
  '{"type":"finish-step"}',
  '{"type":"finish"}',
  '[DONE]',
]
  .map((data) => `data: ${data}\n\n`)
  .join('');

describe('chat auto-scroll while streaming', () => {
  beforeEach(() => {
    scrollToBottomSpy.mockClear();
  });

  test('re-pins to the bottom on message updates during streaming', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const search = instantsearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
    });

    search.addWidgets([
      chat({
        container,
        disableTriggerValidation: true,
        transport: {
          fetch: () =>
            Promise.resolve(
              new Response(STREAM, {
                headers: { 'Content-Type': 'text/event-stream' },
              })
            ),
        },
      }),
    ]);

    search.start();
    await wait(0);

    const chatRenderState = (
      search.renderState.indexName as {
        chat: { sendMessage: (message: { text: string }) => void };
      }
    ).chat;

    chatRenderState.sendMessage({ text: 'hi' });

    // While streaming, message/status updates must re-pin to the bottom, using
    // the "only if already at the bottom" gate so it can't fight a user who
    // scrolled up.
    await waitFor(() => {
      expect(scrollToBottomSpy).toHaveBeenCalledWith({
        preserveScrollPosition: true,
      });
    });
  });
});
