/**
 * @jest-environment @instantsearch/testutils/jest-environment-node.js
 */

import {
  createCompositionClient,
  createControlledCompositionClient,
} from '@instantsearch/mocks';

import { connectConfigure, connectSearchBox } from '../../connectors';
import instantsearch from '../../index.es';
import { waitForResults } from '../server';

describe('waitForResults', () => {
  test('waits for the results from the search instance', async () => {
    const { searchClient, searches } = createControlledCompositionClient();
    const search = instantsearch({
      compositionID: 'my-composition',
      searchClient,
      initialUiState: {
        'my-composition': {
          query: 'apple',
        },
      },
    }).addWidgets([
      connectConfigure(() => {})({ searchParameters: { hitsPerPage: 2 } }),
      connectSearchBox(() => {})({}),
    ]);

    search.start();

    const output = waitForResults(search);

    searches[0].resolver();

    await expect(output).resolves.toEqual([
      expect.objectContaining({ query: 'apple', hitsPerPage: 2 }),
    ]);
  });

  test('throws on a search client error', async () => {
    const { searchClient, searches } = createControlledCompositionClient();
    const search = instantsearch({
      compositionID: 'my-composition',
      searchClient,
    }).addWidgets([connectSearchBox(() => {})({})]);

    search.start();

    const output = waitForResults(search);

    searches[0].rejecter({ message: 'Search error' });

    await expect(output).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Search error"`
    );
  });

  test('throws on an InstantSearch error', async () => {
    const search = instantsearch({
      compositionID: 'my-composition',
      searchClient: createCompositionClient(),
    }).addWidgets([connectSearchBox(() => {})({})]);

    search.start();

    const output = waitForResults(search);

    search.on('error', () => {});
    search.emit('error', new Error('Search error'));

    await expect(output).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Search error"`
    );
  });
});
