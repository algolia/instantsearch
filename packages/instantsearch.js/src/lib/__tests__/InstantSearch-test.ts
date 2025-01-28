import { createSearchClient } from '@instantsearch/mocks';

import InstantSearch from '../InstantSearch';
import version from '../version';

it('calls addAlgoliaAgent', () => {
  const searchClient = createSearchClient({
    addAlgoliaAgent: jest.fn(),
  });

  // eslint-disable-next-line no-new
  new InstantSearch({
    indexName: 'indexName',
    searchClient,
  });

  expect(searchClient.addAlgoliaAgent).toHaveBeenCalledTimes(2);
  expect(searchClient.addAlgoliaAgent).toHaveBeenCalledWith(
    expect.stringMatching(/^instantsearch-core \(.*\)$/)
  );
  expect(searchClient.addAlgoliaAgent).toHaveBeenCalledWith(
    `instantsearch.js (${version})`
  );
});
