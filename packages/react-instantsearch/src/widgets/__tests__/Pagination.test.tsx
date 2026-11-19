/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import {
  createMultiSearchResponse,
  createAlgoliaSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { Pagination } from '../Pagination';

import type { MockSearchClient } from '@instantsearch/mocks';
import type { SearchClient } from 'instantsearch-core';

function createMockedSearchClient({ nbPages }: { nbPages?: number } = {}) {
  return createAlgoliaSearchClient({
    search: jest.fn((requests) =>
      Promise.resolve(
        createMultiSearchResponse(
          ...requests.map(
            (request: Parameters<SearchClient['search']>[0][number]) =>
              createSingleSearchResponse({
                hits: Array.from({ length: 1000 }).map((_, index) => ({
                  objectID: String(index),
                })),
                index: request.indexName,
                nbPages,
              })
          )
        )
      )
    ) as MockSearchClient['search'],
  });
}

describe('Pagination', () => {
  test('forwards custom class names and `div` props to the root element', () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <Pagination
          className="MyPagination"
          classNames={{ root: 'ROOT' }}
          title="Some custom title"
        />
      </InstantSearchTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyPagination', 'ROOT');
    expect(root).toHaveAttribute('title', 'Some custom title');
  });

  test('renders with translations', async () => {
    const { getByRole, findByRole } = render(
      <InstantSearchTestWrapper
        searchClient={createMockedSearchClient({ nbPages: 3 })}
      >
        <Pagination
          translations={{
            firstPageItemAriaLabel: 'First page',
            lastPageItemAriaLabel: 'Last page',
            nextPageItemAriaLabel: 'Next page',
            previousPageItemAriaLabel: 'Previous page',
            pageItemAriaLabel: ({ currentPage, nbPages }) =>
              `Page number ${currentPage} of ${nbPages}`,
            firstPageItemText: 'First',
            lastPageItemText: 'Last',
            nextPageItemText: 'Next',
            previousPageItemText: 'Previous',
            pageItemText: ({ currentPage, nbPages }) =>
              `#${currentPage}/${nbPages}`,
          }}
        />
      </InstantSearchTestWrapper>
    );

    await waitFor(() =>
      expect(
        document.querySelectorAll('.ais-Pagination-item--page')
      ).toHaveLength(3)
    );

    // So we can test all links, we choose a page in the middle
    userEvent.click(
      getByRole('link', {
        name: /page number 2 of 3/i,
      })
    );

    const firstPageLink = await findByRole('link', {
      name: 'First page',
    });
    expect(firstPageLink).toHaveTextContent('First');

    const previousPageLink = getByRole('link', {
      name: 'Previous page',
    });
    expect(previousPageLink).toHaveTextContent('Previous');

    const nextPageLink = getByRole('link', {
      name: 'Next page',
    });
    expect(nextPageLink).toHaveTextContent('Next');

    const lastPageLink = getByRole('link', {
      name: 'Last page',
    });
    expect(lastPageLink).toHaveTextContent('Last');

    const pageLink = getByRole('link', {
      name: /page number 1 of 3/i,
    });
    expect(pageLink).toHaveTextContent('#1/3');
  });
});
