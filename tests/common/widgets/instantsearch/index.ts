import {
  createAlgoliaSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { getByRole } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { fakeAct } from '../../common';

import { createAlgoliaAgentTests } from './algolia-agent';

import type { TestOptions, TestSetup } from '../../common';

export type InstantSearchWidgetSetup = TestSetup<
  Record<string, unknown>,
  {
    algoliaAgents: string[];
  }
>;

export function createInstantSearchWidgetTests(
  setup: InstantSearchWidgetSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('InstantSearch widget common tests', () => {
    createAlgoliaAgentTests(setup, { act, skippedTests });

    describe.only('preserveSharedStateOnUnmount', () => {
      it('should clean state when `false`', async () => {
        const searchClient = createAlgoliaSearchClient({
          search: jest.fn(async (requests) => {
            await wait(100);
            return createMultiSearchResponse(
              ...requests.map(() =>
                createSingleSearchResponse({
                  facets: {
                    brand: {
                      'Insignia™': 746,
                      Samsung: 633,
                      Metra: 591,
                      HP: 530,
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
            );
          }),
        });

        await setup({
          instantSearchOptions: {
            searchClient,
            indexName: 'indexName',
            future: {
              preserveSharedStateOnUnmount: false,
            },
          },
        });

        await act(async () => {
          await wait(100 + 10);
        });

        function getFacetValues(refinementListElement: HTMLElement) {
          return [
            ...refinementListElement.querySelectorAll(
              '.ais-RefinementList-item'
            ),
          ].map(
            (li) =>
              `${
                li.querySelector('.ais-RefinementList-labelText')?.textContent
              } ${
                li.querySelector<HTMLInputElement>(
                  '.ais-RefinementList-checkbox'
                )?.checked
                  ? 'checked'
                  : 'unchecked'
              }`
          );
        }

        const refinementList1 =
          document.querySelector<HTMLElement>('.refinement-list-1')!;
        const refinementList2 =
          document.querySelector<HTMLElement>('.refinement-list-2')!;

        // Initial state
        expect(searchClient.search).toHaveBeenCalledTimes(1);
        expect(getFacetValues(refinementList1)).toMatchInlineSnapshot(`
          [
            "Insignia™ unchecked",
            "Samsung unchecked",
            "Metra unchecked",
            "HP unchecked",
          ]
        `);

        expect(getFacetValues(refinementList2)).toMatchInlineSnapshot(`
          [
            "Insignia™ unchecked",
            "Samsung unchecked",
            "Metra unchecked",
            "HP unchecked",
          ]
        `);

        // Refine
        const firstElement = refinementList1.querySelector('li input')!;
        await act(async () => {
          userEvent.click(firstElement);
          await wait(100 + 10);
        });

        expect(searchClient.search).toHaveBeenCalledTimes(2);
        expect(getFacetValues(refinementList1)).toMatchInlineSnapshot(`
          [
            "Insignia™ checked",
            "Samsung unchecked",
            "Metra unchecked",
            "HP unchecked",
          ]
        `);

        expect(getFacetValues(refinementList2)).toMatchInlineSnapshot(`
          [
            "Insignia™ checked",
            "Samsung unchecked",
            "Metra unchecked",
            "HP unchecked",
          ]
        `);

        // Remove first refinement list
        await act(async () => {
          userEvent.click(getByRole(document.body, 'button'));
          await wait(100 + 10);
        });

        expect(searchClient.search).toHaveBeenCalledTimes(3);
        expect(searchClient.search).toHaveBeenLastCalledWith([
          {
            indexName: 'indexName',
            params: {
              facets: ['brand'],
              maxValuesPerFacet: 10,
              tagFilters: '',
            },
          },
        ]);

        await act(async () => {
          await wait(1000);
        });

        expect(document.querySelector('.refinement-list-1')).toBeNull();
        expect(getFacetValues(refinementList2)).toMatchInlineSnapshot(`
          [
            "Insignia™ unchecked",
            "Samsung unchecked",
            "Metra unchecked",
            "HP unchecked",
          ]
        `);
      });
    });
  });
}
