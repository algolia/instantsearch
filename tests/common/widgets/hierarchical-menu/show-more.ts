import { wait } from '@instantsearch/testutils';
import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';

import type { HierarchicalMenuSetup } from '.';
import type { Act } from '../../common';

export function createShowMoreTests(setup: HierarchicalMenuSetup, act: Act) {
  describe('show more', () => {
    test('receives a count of facet values', async () => {
      const delay = 100;
      const margin = 10;
      const attributes = ['brand'];
      const limit = 2;
      const showMoreLimit = 6;

      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient({
            search: jest.fn(async (requests) => {
              await wait(delay);
              return createMultiSearchResponse(
                ...requests.map(() =>
                  createSingleSearchResponse({
                    facets: {
                      [attributes[0]]: {
                        Apple: 746,
                        Samsung: 633,
                        Metra: 591,
                        HP: 530,
                        'Insignia™': 442,
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
              );
            }),
          }),
        },
        widgetParams: {
          attributes,
          limit,
          showMoreLimit,
          showMore: true,
          templates: {
            // @ts-ignore
            showMoreText({ isShowingMore, showMoreCount }) {
              return !isShowingMore
                ? `Show ${showMoreCount} more`
                : 'Show top items';
            },
          },
        },
      };

      await setup(options);

      await act(async () => {
        await wait(margin + delay);
        await wait(0);
      });

      expect(
        document.querySelector('.ais-HierarchicalMenu-showMore')
      ).toHaveTextContent(`Show ${showMoreLimit - limit} more`);
    });
  });
}
