/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { useRefinementList } from 'react-instantsearch-core';

import { ClearRefinements } from '../ClearRefinements';

import type { UseRefinementListProps } from 'react-instantsearch-core';

describe('ClearRefinements', () => {
  test('forwards custom class names and `div` props to the root element', () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <ClearRefinements
          className="MyClearsRefinements"
          classNames={{ root: 'ROOT' }}
          title="Some custom title"
        />
      </InstantSearchTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyClearsRefinements', 'ROOT');
    expect(root).toHaveAttribute('title', 'Some custom title');
  });

  test('renders with translations', async () => {
    const searchClient = createSearchClient({});
    const { getByRole } = render(
      <InstantSearchTestWrapper
        searchClient={searchClient}
        initialUiState={{
          indexName: {
            refinementList: {
              brand: ['Apple'],
            },
          },
        }}
      >
        <RefinementList attribute="brand" />
        <ClearRefinements translations={{ resetButtonText: 'Reset' }} />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));

    expect(getByRole('button', { name: 'Reset' })).toBeInTheDocument();
  });
});

function RefinementList(props: UseRefinementListProps) {
  useRefinementList(props);

  return null;
}
