import { resolveEndpoint } from '../endpoint';

describe('resolveEndpoint', () => {
  describe('credentials', () => {
    it('builds the tasks endpoint and sets the Algolia auth headers', () => {
      const resolved = resolveEndpoint({
        appId: 'APP',
        apiKey: 'KEY',
        agentId: 'my-agent',
      });

      expect(resolved.endpoint).toBe(
        'https://APP.algolia.net/agent-studio/1/agents/my-agent/tasks'
      );
      expect(resolved.headers).toMatchObject({
        'x-algolia-application-id': 'APP',
        'x-algolia-api-key': 'KEY',
      });
    });

    it('appends the `; tasks` marker to the x-algolia-agent header', () => {
      const resolved = resolveEndpoint({
        appId: 'APP',
        apiKey: 'KEY',
        agentId: 'my-agent',
        algoliaAgent: 'instantsearch.js (4.95.0)',
      });

      expect(resolved.headers['x-algolia-agent']).toBe(
        'instantsearch.js (4.95.0); tasks'
      );
    });

    it('omits the x-algolia-agent header when no algoliaAgent is provided', () => {
      const resolved = resolveEndpoint({
        appId: 'APP',
        apiKey: 'KEY',
        agentId: 'my-agent',
      });

      expect(resolved.headers).not.toHaveProperty('x-algolia-agent');
    });

    it('throws when credentials are incomplete', () => {
      expect(() =>
        resolveEndpoint({ appId: 'APP', agentId: 'my-agent' })
      ).toThrowError(/transport.*appId, apiKey, agentId/);
    });
  });

  describe('transport', () => {
    it('uses the transport endpoint and headers verbatim', () => {
      const prepareSendMessagesRequest = jest.fn();
      const resolved = resolveEndpoint({
        transport: {
          api: 'https://custom.test/tasks',
          headers: { 'x-custom': '1' },
          prepareSendMessagesRequest,
        },
      });

      expect(resolved.endpoint).toBe('https://custom.test/tasks');
      expect(resolved.headers).toEqual({ 'x-custom': '1' });
      expect(resolved.prepareSendMessagesRequest).toBe(
        prepareSendMessagesRequest
      );
    });
  });
});
