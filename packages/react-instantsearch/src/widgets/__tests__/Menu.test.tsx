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

import { Menu } from '../Menu';

function createMockedSearchClient() {
  return createAlgoliaSearchClient({
    search: jest.fn((requests) => {
      return Promise.resolve(
        createMultiSearchResponse(
          ...requests.map(() =>
            createSingleSearchResponse({
              facets: {
                brand: {
                  'Insignia™': 746,
                  Samsung: 633,
                  Metra: 591,
                  HP: 530,
                  Apple: 442,
                  GE: 394,
                  Sony: 350,
                  Incipio: 320,
                  KitchenAid: 318,
                  Whirlpool: 298,
                  LG: 291,
                  Canon: 287,
                  Frigidaire: 275,
                  Speck: 216,
                  OtterBox: 214,
                  Epson: 204,
                  'Dynex™': 184,
                  Dell: 174,
                  'Hamilton Beach': 173,
                  Platinum: 155,
                },
              },
              renderingContent: {
                facetOrdering: {
                  values: {
                    brand: {
                      sortRemainingBy: 'count',
                    },
                  },
                },
              },
            })
          )
        )
      );
    }),
  });
}

describe('Menu', () => {
  test('forwards custom class names and `div` props to the root element', () => {
    const searchClient = createMockedSearchClient();
    const { container } = render(
      <InstantSearchTestWrapper searchClient={searchClient}>
        <Menu
          attribute="brand"
          className="MyMenu"
          classNames={{ root: 'ROOT' }}
          title="Some custom title"
        />
      </InstantSearchTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyMenu', 'ROOT');
    expect(root).toHaveAttribute('title', 'Some custom title');
  });

  test('renders with translations', async () => {
    const searchClient = createMockedSearchClient();
    const { getByRole } = render(
      <InstantSearchTestWrapper searchClient={searchClient}>
        <Menu
          attribute="brand"
          translations={{
            showMoreButtonText({ isShowingMore }) {
              return isShowingMore ? 'Show less brands' : 'Show more brands';
            },
          }}
          showMore
        />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(1);
    });

    const button = getByRole('button', { name: 'Show more brands' });

    expect(button).toBeInTheDocument();

    userEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveTextContent('Show less brands');
    });
  });
});
