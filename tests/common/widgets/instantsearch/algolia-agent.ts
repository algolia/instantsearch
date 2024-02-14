import algoliarecommend from '@algolia/recommend';
import algoliasearch from 'algoliasearch';

import type { InstantSearchWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createAlgoliaAgentTests(
  setup: InstantSearchWidgetSetup,
  _options: Required<TestOptions>
) {
  describe('Algolia agent', () => {
    test('sets the correct Algolia agents on the Search client', async () => {
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

    test('sets the correct Algolia agents on the Recommend client', async () => {
      const searchClient = algoliasearch('appId', 'apiKey');
      const recommendClient = algoliarecommend('appId', 'apiKey');
      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
          recommendClient,
        },
        widgetParams: {},
      };

      const { algoliaAgents } = await setup(options);

      const { value: algoliaAgent } = recommendClient.transporter.userAgent;

      expect(algoliaAgent.split(';').map((agent) => agent.trim())).toEqual(
        expect.arrayContaining(algoliaAgents)
      );
    });
  });
}
