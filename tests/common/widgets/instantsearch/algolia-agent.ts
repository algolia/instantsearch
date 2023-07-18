import algoliasearch from 'algoliasearch';
import type { InstantSearchWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createAlgoliaAgentTests(
  setup: InstantSearchWidgetSetup,
  _options: Required<TestOptions>
) {
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
