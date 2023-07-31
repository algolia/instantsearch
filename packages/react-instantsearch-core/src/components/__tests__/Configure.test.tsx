/**
 * @jest-environment jsdom
 */

import { createSearchClient } from '@instantsearch/mocks';
import { act, render, waitFor } from '@testing-library/react';
import React from 'react';

import { Configure } from '../Configure';
import { InstantSearch } from '../InstantSearch';

describe('Configure', () => {
  test('does not render anything', () => {
    const searchClient = createSearchClient({});

    const { container } = render(
      <InstantSearch indexName="indexName" searchClient={searchClient}>
        <Configure hitsPerPage={666} />
      </InstantSearch>
    );

    expect(container).toMatchInlineSnapshot(`<div />`);
  });

  test('sets search parameters', async () => {
    const searchClient = createSearchClient({});

    act(() => {
      render(
        <InstantSearch indexName="indexName" searchClient={searchClient}>
          <Configure hitsPerPage={666} />
        </InstantSearch>
      );
    });

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(1);
      expect(searchClient.search).toHaveBeenCalledWith([
        {
          indexName: 'indexName',
          params: expect.objectContaining({
            hitsPerPage: 666,
          }),
        },
      ]);
    });
  });
});
