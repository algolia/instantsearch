/**
 * @jest-environment jsdom @instantsearch/testutils/jest-environment-jsdom.ts
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

  test('does not break for aroundRadius="all"', async () => {
    const searchClient = createSearchClient({});

    /**
     * Inside the helper, aroundRadius is one of the "numeric" parameters. This means
     * that it goes through the flow of _parseNumbers when a SearchParameters object is
     * created.
     *
     * The _parseNumbers function is responsible for converting the value of aroundRadius
     * to a number. However if it is set to "all", it should not be converted to a number.
     *
     * Due to this logic, the props get copied to the search parameters object as is. This
     * could be problematic if we use the React `props` object directly in the helper, as
     * its keys are not writable.
     *
     * This test exists to ensure that the helper does not break when aroundRadius is set
     * to "all".
     *
     * For the bug report, see: https://github.com/algolia/instantsearch/issues/6136, and
     * a relevant part of the code being edited: https://github.com/algolia/instantsearch/pull/6011
     */

    render(
      <InstantSearch indexName="indexName" searchClient={searchClient}>
        <Configure aroundRadius="all" />
      </InstantSearch>
    );

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(1);
      expect(searchClient.search).toHaveBeenCalledWith([
        {
          indexName: 'indexName',
          params: expect.objectContaining({
            aroundRadius: 'all',
          }),
        },
      ]);
    });
  });
});
