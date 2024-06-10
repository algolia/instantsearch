/**
 * @jest-environment jsdom
 */

import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import React from 'react';

import { RangeInput } from '../RangeInput';

function createMockedSearchClient() {
  return createSearchClient({
    search: jest.fn((requests) => {
      return Promise.resolve(
        createMultiSearchResponse(
          ...requests.map(() =>
            createSingleSearchResponse({
              facets: {
                price: {},
              },
              facets_stats: {
                price: {
                  min: 1,
                  max: 1000,
                  avg: 0,
                  sum: 0,
                },
              },
            })
          )
        )
      );
    }),
  });
}

describe('RangeInput', () => {
  test('forwards custom class names and `div` props to the root element', () => {
    const searchClient = createMockedSearchClient();
    const { container } = render(
      <InstantSearchTestWrapper searchClient={searchClient}>
        <RangeInput
          attribute="price"
          className="MyRangeInput"
          classNames={{ root: 'ROOT' }}
          title="Some custom title"
        />
      </InstantSearchTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyRangeInput', 'ROOT');
    expect(root).toHaveAttribute('title', 'Some custom title');
  });

  test('renders with translations', async () => {
    const searchClient = createMockedSearchClient();
    const { container } = render(
      <InstantSearchTestWrapper searchClient={searchClient}>
        <RangeInput
          attribute="price"
          translations={{
            separatorElementText: 'to',
            submitButtonText: 'Send',
          }}
        />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(1);
    });

    expect(
      container.querySelector('.ais-RangeInput-separator')
    ).toHaveTextContent('to');

    expect(container.querySelector('.ais-RangeInput-submit')).toHaveTextContent(
      'Send'
    );
  });
});
