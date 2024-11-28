/**
 * @jest-environment jsdom
 */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { act, render } from '@testing-library/react';
import React from 'react';
import { SearchBox } from 'react-instantsearch';

import { InstantSearchNext } from '../InstantSearchNext';

test('it rerenders without triggering a client-side search', async () => {
  const client = createSearchClient();

  function Component() {
    return (
      <InstantSearchNext searchClient={client} indexName="indexName">
        <SearchBox />
      </InstantSearchNext>
    );
  }

  const { rerender } = render(<Component />);

  await act(async () => {
    await wait(0);
  });

  rerender(<Component />);

  await act(async () => {
    await wait(0);
  });

  expect(client.search).toHaveBeenCalledTimes(0);
});
