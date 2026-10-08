import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { createDefaultWidgetParams, openChat } from '../chat/utils';

import type { AlgoliaProviderWidgetSetup } from '.';
import type { TestOptions } from '../../common';

function streamedText(messageId: string, text: string) {
  const chunks = [
    { type: 'start', messageId },
    { type: 'text-start', id: `${messageId}-text` },
    { type: 'text-delta', id: `${messageId}-text`, delta: text },
    { type: 'text-end', id: `${messageId}-text` },
    { type: 'finish' },
  ];

  return new Response(
    `${chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join('')}data: [DONE]\n\n`,
    { headers: { 'Content-Type': 'text/event-stream' } }
  );
}

export function createChatTests(
  setup: AlgoliaProviderWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('chat and chatTrigger', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
      global.fetch = originalFetch;
    });

    function widgetParams() {
      return {
        javascript: { chat: createDefaultWidgetParams() },
        react: { chat: createDefaultWidgetParams() },
        vue: {},
      };
    }

    test('renders a closed chat and its trigger without searching', async () => {
      const searchClient = createSearchClient();

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: widgetParams(),
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-ChatToggleButton')
      ).toBeInTheDocument();
      expect(document.querySelector('.ais-Chat')).toBeInTheDocument();
      expect(
        document.querySelector('.ais-Chat-container--open')
      ).not.toBeInTheDocument();
      expect(searchClient.search).not.toHaveBeenCalled();
    });

    test('opens and closes the chat from the trigger', async () => {
      const searchClient = createSearchClient();

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: widgetParams(),
      });

      await openChat(act);

      expect(
        document.querySelector('.ais-Chat-container--open')
      ).toBeInTheDocument();
      expect(
        document.querySelector('.ais-ChatToggleButton--open')
      ).toBeInTheDocument();

      userEvent.click(document.querySelector('.ais-ChatToggleButton')!);
      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-Chat-container--open')
      ).not.toBeInTheDocument();
      expect(
        document.querySelector('.ais-ChatToggleButton--open')
      ).not.toBeInTheDocument();
      expect(searchClient.search).not.toHaveBeenCalled();
    });

    test('sends the conversation to Agent Studio with the credentials of the search client', async () => {
      const searchClient = createSearchClient();
      const fetchMock = jest.fn(() =>
        Promise.resolve(streamedText('assistant-1', 'Hello from the agent'))
      );
      global.fetch = fetchMock as unknown as typeof fetch;

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: widgetParams(),
      });

      await openChat(act);

      userEvent.type(
        document.querySelector('.ais-ChatPrompt-textarea')!,
        'Hi there'
      );
      userEvent.click(document.querySelector('.ais-ChatPrompt-submit')!);

      await waitFor(() => {
        expect(
          document.querySelector('.ais-ChatMessages')!.textContent
        ).toContain('Hello from the agent');
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0] as unknown as [
        string,
        RequestInit,
      ];
      // `URL` lowercases the host, and the credentials are the ones the search
      // client was created with.
      expect(url).toBe(
        'https://appid.algolia.net/agent-studio/1/agents/agentId/completions?compatibilityMode=ai-sdk-5'
      );
      expect(init.headers).toEqual(
        expect.objectContaining({
          'x-algolia-application-id': 'appId',
          'x-algolia-api-key': 'apiKey',
        })
      );
      expect(searchClient.search).not.toHaveBeenCalled();
    });
  });
}
