import algoliasearchV3 from 'algoliasearch-v3';
import algoliasearchV4 from 'algoliasearch-v4';
import { algoliasearch as algoliasearchV5 } from 'algoliasearch-v5';

import type { InstantSearchWidgetSetup } from '.';
import type { TestOptions } from '../../common';
import type { SearchClient } from 'instantsearch.js';

export function createAlgoliaAgentTests(
  setup: InstantSearchWidgetSetup,
  _options: Required<TestOptions>
) {
  describe('algolia agent', () => {
    test('sets the correct algolia agents with v3', async () => {
      const searchClient = algoliasearchV3(
        'appId',
        'apiKey'
      ) as unknown as SearchClient;
      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {},
      };

      const { algoliaAgents } = await setup(options);

      const algoliaAgent: string = getAgent(searchClient);

      expect(algoliaAgent.split(';').map((agent) => agent.trim())).toEqual(
        expect.arrayContaining(algoliaAgents)
      );
    });

    test('sets the correct algolia agents with v4', async () => {
      const searchClient = algoliasearchV4(
        'appId',
        'apiKey'
      ) as unknown as SearchClient;
      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {},
      };

      const { algoliaAgents } = await setup(options);

      const algoliaAgent: string = getAgent(searchClient);

      expect(algoliaAgent.split(';').map((agent) => agent.trim())).toEqual(
        expect.arrayContaining(algoliaAgents)
      );
    });

    test('sets the correct algolia agents', async () => {
      const searchClient = algoliasearchV5(
        'appId',
        'apiKey'
      ) as unknown as SearchClient;
      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {},
      };

      const { algoliaAgents } = await setup(options);

      const algoliaAgent: string = getAgent(searchClient);

      expect(algoliaAgent.split(';').map((agent) => agent.trim())).toEqual(
        expect.arrayContaining(algoliaAgents)
      );
    });
  });
}

function getAgent(searchClient: any) {
  if (searchClient.transporter && searchClient.transporter.userAgent) {
    return searchClient.transporter.userAgent.value;
  }
  if (searchClient.transporter && searchClient.transporter.algoliaAgent) {
    return searchClient.transporter.algoliaAgent.value;
  }
  if (searchClient._ua) {
    return searchClient._ua;
  }

  throw new Error('Could not find the algolia agent');
}
