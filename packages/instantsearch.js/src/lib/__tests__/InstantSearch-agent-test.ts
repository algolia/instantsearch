/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';

import InstantSearch from '../InstantSearch';
import version from '../version';

describe('InstantSearch (IS.js subclass)', () => {
  it('adds the `instantsearch.js` user agent', () => {
    const searchClient = createSearchClient({
      addAlgoliaAgent: jest.fn(),
    });

    // eslint-disable-next-line no-new
    new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });

    expect(searchClient.addAlgoliaAgent).toHaveBeenCalledTimes(1);
    expect(searchClient.addAlgoliaAgent).toHaveBeenCalledWith(
      `instantsearch.js (${version})`
    );
  });
});
