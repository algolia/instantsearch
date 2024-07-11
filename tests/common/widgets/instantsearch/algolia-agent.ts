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

      const algoliaAgent: string = (searchClient as any).transporter
        ? (searchClient as any).transporter.userAgent.value
        : (searchClient as any)._ua;

      expect(algoliaAgent.split(';').map((agent) => agent.trim())).toEqual(
        expect.arrayContaining(algoliaAgents)
      );
    });
  });
}
