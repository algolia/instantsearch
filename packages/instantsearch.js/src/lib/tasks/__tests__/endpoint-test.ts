/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createTaskTransport } from '../endpoint';

function createFetch() {
  return jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>(() =>
    Promise.resolve(
      new Response(JSON.stringify({ output: { ok: true } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )
  );
}

function send(transport: ReturnType<typeof createTaskTransport>) {
  return transport.sendTask({ task: 'task', input: {}, stream: false });
}

describe('createTaskTransport', () => {
  describe('credentials', () => {
    it('builds the tasks endpoint and sets the Algolia auth headers', async () => {
      const customFetch = createFetch();
      const transport = createTaskTransport({
        appId: 'APP',
        apiKey: 'KEY',
        agentId: 'my-agent',
        transport: { fetch: customFetch },
      });

      await send(transport);

      const [[url, request]] = customFetch.mock.calls;
      expect(url).toBe(
        'https://APP.algolia.net/agent-studio/1/agents/my-agent/tasks'
      );
      expect(request?.headers).toMatchObject({
        'x-algolia-application-id': 'APP',
        'x-algolia-api-key': 'KEY',
      });
    });

    it('appends the `; tasks` marker to the x-algolia-agent header', async () => {
      const customFetch = createFetch();
      const transport = createTaskTransport({
        appId: 'APP',
        apiKey: 'KEY',
        agentId: 'my-agent',
        algoliaAgent: 'instantsearch.js (4.95.0)',
        transport: { fetch: customFetch },
      });

      await send(transport);

      const [[, request]] = customFetch.mock.calls;
      expect(request?.headers).toMatchObject({
        'x-algolia-agent': 'instantsearch.js (4.95.0); tasks',
      });
    });

    it('omits the x-algolia-agent header when no algoliaAgent is provided', async () => {
      const customFetch = createFetch();
      const transport = createTaskTransport({
        appId: 'APP',
        apiKey: 'KEY',
        agentId: 'my-agent',
        transport: { fetch: customFetch },
      });

      await send(transport);

      const [[, request]] = customFetch.mock.calls;
      expect(request?.headers).not.toHaveProperty('x-algolia-agent');
    });

    it('throws when credentials are incomplete', () => {
      expect(() =>
        createTaskTransport({ appId: 'APP', agentId: 'my-agent' })
      ).toThrowError(/appId.*apiKey.*agentId/);
    });
  });

  describe('transport', () => {
    it('uses the transport endpoint and headers verbatim', async () => {
      const customFetch = createFetch();
      const transport = createTaskTransport({
        transport: {
          api: 'https://custom.test/tasks',
          headers: { 'x-custom': '1' },
          fetch: customFetch,
        },
      });

      await send(transport);

      expect(customFetch).toHaveBeenCalledWith(
        'https://custom.test/tasks',
        expect.objectContaining({
          headers: {
            'x-custom': '1',
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('composes explicit transport options with protected agent headers', async () => {
      const customFetch = createFetch();
      const prepareSendMessagesRequest = jest.fn(
        (request: {
          task?: string;
          input: Record<string, unknown>;
          stream: boolean;
          body: Record<string, unknown> | undefined;
          credentials: RequestCredentials | undefined;
          headers: HeadersInit | undefined;
          api: string;
        }) => ({
          body: {
            task: request.task,
            input: request.input,
            ...request.body,
          },
          headers: {
            'x-prepared': 'yes',
            'x-algolia-application-id': 'spoofed-app',
            'X-Algolia-API-Key': 'spoofed-key',
            'x-algolia-agent': 'spoofed-agent',
          },
        })
      );
      const taskTransport = createTaskTransport({
        appId: 'APP',
        apiKey: 'KEY',
        agentId: 'agent',
        algoliaAgent: 'instantsearch.js (4.95.0)',
        transport: {
          api: 'https://custom.test/tasks',
          credentials: 'include',
          headers: {
            'x-custom': '1',
            'X-Algolia-Application-ID': 'spoofed-app',
          },
          body: { locale: 'en' },
          fetch: customFetch,
          prepareSendMessagesRequest,
        },
      });

      await expect(
        taskTransport.sendTask({
          task: 'generate',
          input: { query: 'shoes' },
          stream: false,
        })
      ).resolves.toEqual({ ok: true });

      expect(prepareSendMessagesRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          task: 'generate',
          input: { query: 'shoes' },
          stream: false,
          body: { locale: 'en' },
          credentials: 'include',
          api: 'https://custom.test/tasks',
          headers: expect.objectContaining({
            'x-custom': '1',
            'x-algolia-application-id': 'APP',
            'x-algolia-api-key': 'KEY',
            'x-algolia-agent': 'instantsearch.js (4.95.0); tasks',
          }),
        })
      );
      expect(
        prepareSendMessagesRequest.mock.calls[0][0].headers
      ).not.toHaveProperty('X-Algolia-Application-ID');
      expect(customFetch).toHaveBeenCalledTimes(1);
      expect(customFetch).toHaveBeenCalledWith(
        'https://custom.test/tasks',
        expect.objectContaining({
          credentials: 'include',
          headers: {
            'x-prepared': 'yes',
            'x-algolia-application-id': 'APP',
            'x-algolia-api-key': 'KEY',
            'x-algolia-agent': 'instantsearch.js (4.95.0); tasks',
            'Content-Type': 'application/json',
          },
        })
      );
    });
  });
});
