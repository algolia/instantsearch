import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import type { SharedSetup } from '.';
import type { TestOptions } from '../../common';
import type { MockSearchClient } from '@instantsearch/mocks';
import type { SearchClient } from 'instantsearch.js';

export function createInteractionTests(
  setup: SharedSetup,
  { act }: Required<TestOptions>
) {
  describe('interaction', () => {
    describe('hierarchical menu and breadcrumb', () => {
      test('breadcrumb generation', async () => {
        const delay = 100;
        const margin = 10;
        const attribute = 'one';
        const hierarchicalAttribute = 'hierarchicalCategories.lvl0';

        const options = {
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient: createSearchClient({
              search: jest.fn(async (requests) => {
                await wait(delay);
                return createMultiSearchResponse(
                  ...requests.map(
                    ({
                      params,
                    }: Parameters<SearchClient['search']>[0][number]) =>
                      createSingleSearchResponse({
                        facets: {
                          [attribute]: {
                            Samsung: 100,
                            Apple: 200,
                          },
                          [hierarchicalAttribute]: {
                            'Computers & Tablets': 148,
                          },
                        },
                        page: params.page,
                        nbPages: 20,
                      })
                  )
                );
              }) as MockSearchClient['search'],
            }),
          },
          widgetParams: {
            menu: {
              attribute,
            },
            hits: {},
            pagination: {},
            hierarchicalMenu: { attributes: [hierarchicalAttribute] },
          },
        };

        await setup(options);

        // Wait for initial results to populate widgets with data
        await act(async () => {
          await wait(margin + delay);
          await wait(0);
        });

        const hierarchicalLink = screen.getByRole('link', {
          name: 'Computers & Tablets 148',
        });
        userEvent.click(hierarchicalLink);

        await act(async () => {
          await wait(0);
        });

        const breadcrumbs = document.querySelectorAll(
          '.ais-Breadcrumb-item.ais-Breadcrumb-item--selected'
        );
        expect(breadcrumbs).toHaveLength(1);
        expect(breadcrumbs[0]).toHaveTextContent('Computers & Tablets');
      });
    });
  });
}
