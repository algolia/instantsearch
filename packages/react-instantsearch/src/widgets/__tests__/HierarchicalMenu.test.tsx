/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { HierarchicalMenu } from '../HierarchicalMenu';

const facets = {
  'hierarchicalCategories.lvl0': {
    'Cameras & Camcorders': 1369,
    'Video Games': 505,
    'Wearable Technology': 271,
  },
  'hierarchicalCategories.lvl1': {
    'Cameras & Camcorders > Digital Cameras': 170,
    'Cameras & Camcorders > Memory Cards': 113,
  },
};

const attributes = Object.keys(facets);

describe('HierarchicalMenu', () => {
  test('forwards custom class names and `div` props to the root element', () => {
    const searchClient = createMockedSearchClient();
    const { container } = render(
      <InstantSearchTestWrapper searchClient={searchClient}>
        <HierarchicalMenu
          attributes={attributes}
          className="MyHierarchicalMenu"
          classNames={{ root: 'ROOT' }}
          title="Some custom title"
        />
      </InstantSearchTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyHierarchicalMenu', 'ROOT');
    expect(root).toHaveAttribute('title', 'Some custom title');
  });

  test('renders with translations', async () => {
    const searchClient = createMockedSearchClient();
    const { getByRole } = render(
      <InstantSearchTestWrapper searchClient={searchClient}>
        <HierarchicalMenu
          attributes={attributes}
          limit={1}
          translations={{
            showMoreButtonText({ isShowingMore }: { isShowingMore: boolean }) {
              return isShowingMore
                ? 'Show less categories'
                : 'Show more categories';
            },
          }}
          showMore
        />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(1);
    });

    const button = getByRole('button', { name: 'Show more categories' });

    expect(button).toBeInTheDocument();

    userEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveTextContent('Show less categories');
    });
  });
});

function createMockedSearchClient() {
  const search = jest.fn((requests) =>
    Promise.resolve(
      createMultiSearchResponse(
        ...requests.map(() => createSingleSearchResponse({ facets }))
      )
    )
  );

  return createSearchClient({ search });
}
