import algoliasearch from 'algoliasearch';
import type { InstantSearchSetup } from '.';
import type { Act } from '../../common';

export function createAlgoliaAgentTests(setup: InstantSearchSetup, _act: Act) {
  describe('algolia agent', () => {
    test('sets the correct algolia agents', async () => {
      const searchClient = algoliasearch('appId', 'apiKey');
      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {},
      };

      const { algoliaAgents } = await setup(options);

      const algoliaAgent: string = (searchClient as any).transporter
        ? (searchClient as any).transporter.userAgent.value
        : (searchClient as any)._ua;

      expect(algoliaAgent.split(';').map((agent) => agent.trim())).toEqual(
        expect.arrayContaining(algoliaAgents)
      );
    });
  });
}
