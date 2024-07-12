import {
  algoliasearch as namedConstructor,
  default as defaultConstructor,
} from 'algoliasearch';

import type { InstantSearchWidgetSetup } from '.';
import type { TestOptions } from '../../common';
import type { SearchClient } from 'instantsearch.js';

const algoliasearch = (namedConstructor || defaultConstructor) as unknown as (
  appId: string,
  apiKey: string
) => SearchClient;

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
