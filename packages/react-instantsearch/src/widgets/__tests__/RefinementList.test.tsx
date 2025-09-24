/**
 * @jest-environment jsdom @instantsearch/testutils/jest-environment-jsdom.ts
 */

import {
  createMultiSearchResponse,
  createSearchClient,
  createSFFVResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { RefinementList } from '../RefinementList';

const FACET_HITS = [
  {
    value: 'Apple',
    highlighted: '__ais-highlight__App__/ais-highlight__le',
    count: 442,
  },
  {
    value: 'Alpine',
    highlighted: '__ais-highlight__Alp__/ais-highlight__ine',
    count: 30,
  },
  {
    value: 'APC',
    highlighted: '__ais-highlight__AP__/ais-highlight__C',
    count: 24,
  },
  {
    value: 'Amped Wireless',
    highlighted: '__ais-highlight__Amp__/ais-highlight__ed Wireless',
    count: 4,
  },
  {
    value: "Applebee's",
    highlighted: "__ais-highlight__App__/ais-highlight__lebee's",
    count: 2,
  },
  {
    value: 'Amplicom',
    highlighted: '__ais-highlight__Amp__/ais-highlight__licom',
    count: 1,
  },
  {
    value: 'Apollo Enclosures',
    highlighted: '__ais-highlight__Ap__/ais-highlight__ollo Enclosures',
    count: 1,
  },
  {
    value: 'Apple®',
    highlighted: '__ais-highlight__App__/ais-highlight__le®',
    count: 1,
  },
  {
    value: 'Applica',
    highlighted: '__ais-highlight__App__/ais-highlight__lica',
    count: 1,
  },
  {
    value: 'Apricorn',
    highlighted: '__ais-highlight__Ap__/ais-highlight__ricorn',
    count: 1,
  },
];

function createMockedSearchClient(parameters: Record<string, any> = {}) {
  return createSearchClient({
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
            })
          )
        )
      );
    }),
    // @ts-ignore v5 does not have this method, but it's easier to have it here. In a future version we can replace this method and its usages with search({ type: 'facet })
    searchForFacetValues: jest.fn(() =>
      Promise.resolve([
        createSFFVResponse({
          facetHits: FACET_HITS,
        }),
      ])
    ),
    ...parameters,
  });
}

describe('RefinementList', () => {
  test('forwards custom class names and `div` props to the root element', () => {
    const searchClient = createMockedSearchClient();
    const { container } = render(
      <InstantSearchTestWrapper searchClient={searchClient}>
        <RefinementList
          attribute="brand"
          className="MyRefinementList"
          classNames={{ root: 'ROOT' }}
          title="Some custom title"
        />
      </InstantSearchTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyRefinementList', 'ROOT');
    expect(root).toHaveAttribute('title', 'Some custom title');
  });

  test('renders with translations', async () => {
    const searchClient = createMockedSearchClient({
      searchForFacetValues: jest.fn(
        ([
          {
            params: { facetQuery },
          },
        ]) => {
          return Promise.resolve([
            createSFFVResponse({
              facetHits: facetQuery === 'nothing' ? [] : FACET_HITS,
            }),
          ]);
        }
      ),
    });
    const { container, getByRole } = render(
      <InstantSearchTestWrapper searchClient={searchClient}>
        <RefinementList
          attribute="brand"
          showMore
          translations={{
            noResultsText: 'Zero results',
            resetButtonTitle: 'Reset',
            showMoreButtonText({ isShowingMore }: { isShowingMore: boolean }) {
              return isShowingMore ? 'Show less brands' : 'Show more brands';
            },
            submitButtonTitle: 'Submit',
          }}
          searchable
        />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));

    const showMoreButton = getByRole('button', { name: 'Show more brands' });
    expect(showMoreButton).toBeInTheDocument();
    userEvent.click(showMoreButton);

    await waitFor(() => {
      expect(showMoreButton).toHaveTextContent('Show less brands');
    });

    expect(getByRole('button', { name: 'Submit' })).toBeInTheDocument();

    userEvent.type(
      container.querySelector('.ais-SearchBox-input') as HTMLInputElement,
      'nothing'
    );

    expect(getByRole('button', { name: 'Reset' })).toBeInTheDocument();

    await waitFor(() => {
      expect(searchClient.searchForFacetValues).toHaveBeenCalledTimes(7);

      expect(
        container.querySelector('.ais-RefinementList-noResults')
      ).toHaveTextContent('Zero results');
    });
  });
});
