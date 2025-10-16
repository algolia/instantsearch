/**
 * @jest-environment jsdom
 */

import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { EXPERIMENTAL_Autocomplete } from '../Autocomplete';

describe('Autocomplete', () => {
  function createMockedSearchClient() {
    return createSearchClient({
      // @ts-expect-error - doesn't properly handle multi index, expects all responses to be of the same type
      search: jest.fn(() =>
        Promise.resolve(
          createMultiSearchResponse(
            createSingleSearchResponse({
              hits: [{ objectID: '1', name: 'Item 1' }],
            }),
            // @ts-expect-error - ignore second response type
            createSingleSearchResponse({
              hits: [{ objectID: '2', query: 'hello' }],
            })
          )
        )
      ),
    });
  }

  test('should render a searchbox and indices with hits', async () => {
    const searchClient = createMockedSearchClient();
    render(
      <InstantSearchTestWrapper searchClient={searchClient}>
        <EXPERIMENTAL_Autocomplete
          indices={[
            {
              indexName: 'indexName',
              itemComponent: (props: { name: string }) => props.name,
            },
            {
              indexName: 'indexName2',
              itemComponent: (props: { query: string }) => props.query,
            },
          ]}
        />
      </InstantSearchTestWrapper>
    );

    expect(await screen.findByText('Item 1')).toBeInTheDocument();
    expect(await screen.findByText('hello')).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });
});
