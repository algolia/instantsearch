import {
  createMultiSearchResponse,
  createSingleSearchResponse,
  createCompositionClient,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import userEvent from '@testing-library/user-event';

import type { SharedCompositionSetup } from '.';
import type { TestOptions } from '../../common';

export function createSearchableTests(
  setup: SharedCompositionSetup,
  { act }: Required<TestOptions>
) {
  describe('searchable', () => {
    test('renders search for facet values results', async () => {
      const delay = 100;
      const margin = 10;
      const attribute = 'one';

      const options = {
        instantSearchOptions: {
          compositionID: 'compositionID',
          searchClient: createCompositionClient({
            search: jest.fn(async ({ compositionID }) => {
              if (!compositionID) throw new Error('Missing compositionID');
              await wait(delay);
              return createMultiSearchResponse(
                createSingleSearchResponse({
                  hits: [{ objectID: '1' }],
                  facets: {
                    [attribute]: {
                      Samsung: 100,
                      Apple: 200,
                    },
                  },
                  page: 0,
                  nbPages: 20,
                })
              );
            }) as ReturnType<typeof createCompositionClient>['search'],
            searchForFacetValues: jest.fn(async ({ compositionID }) => {
              if (!compositionID) throw new Error('Missing compositionID');
              await wait(delay);
              return {
                results: [
                  {
                    facetHits: [
                      {
                        value: 'Samsung',
                        count: 100,
                        highlighted: '<em>S</em>amsung',
                      },
                    ],
                    exhaustiveFacetsCount: true,
                  },
                ],
              };
            }) as ReturnType<
              typeof createCompositionClient
            >['searchForFacetValues'],
          }),
        },
        widgetParams: {
          refinementList: { attribute, searchable: true },
        },
      };

      await setup(options);

      // wait for the initial search
      await act(() => wait(delay + margin));

      expect(
        Array.from(
          document.querySelectorAll<HTMLDivElement>(
            '.ais-RefinementList-labelText'
          )
        ).map((el) => el.textContent)
      ).toEqual(['Apple', 'Samsung']);

      userEvent.type(
        document.querySelector(
          '.ais-RefinementList-searchBox .ais-SearchBox-input'
        )!,
        's'
      );

      // wait for the search for facet values
      await act(() => wait(delay + margin));

      expect(
        Array.from(
          document.querySelectorAll<HTMLDivElement>(
            '.ais-RefinementList-labelText'
          )
        ).map((el) => el.textContent)
      ).toEqual(['<em>S</em>amsung']);
    });
  });
}
