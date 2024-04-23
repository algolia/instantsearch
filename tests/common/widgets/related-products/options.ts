import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';

import type { RelatedProductsWidgetSetup } from '.';
import type { TestOptions } from '../../common';
import type { SearchClient } from 'instantsearch.js';

export function createOptionsTests(
  setup: RelatedProductsWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('options', () => {
    test('renders with default props', async () => {
      const searchClient = createMockedSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          objectIDs: ['1'],
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(document.querySelector('.ais-RelatedProducts'))
        .toMatchInlineSnapshot(`
        <section
          class="ais-RelatedProducts"
        >
          <h3
            class="ais-RelatedProducts-title"
          >
            Related products
          </h3>
          <div
            class="ais-RelatedProducts-container"
          >
            <ol
              class="ais-RelatedProducts-list"
            >
              <li
                class="ais-RelatedProducts-item"
              >
                {
          "objectID": "1"
        }
              </li>
              <li
                class="ais-RelatedProducts-item"
              >
                {
          "objectID": "2"
        }
              </li>
            </ol>
          </div>
        </section>
      `);
    });

    test('renders transformed items', async () => {
      const searchClient = createMockedSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          objectIDs: ['1'],
          transformItems(items) {
            return items.map((item) => ({
              ...item,
              objectID: `(${item.objectID})`,
            }));
          },
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(document.querySelector('.ais-RelatedProducts'))
        .toMatchInlineSnapshot(`
        <section
          class="ais-RelatedProducts"
        >
          <h3
            class="ais-RelatedProducts-title"
          >
            Related products
          </h3>
          <div
            class="ais-RelatedProducts-container"
          >
            <ol
              class="ais-RelatedProducts-list"
            >
              <li
                class="ais-RelatedProducts-item"
              >
                {
          "objectID": "(1)"
        }
              </li>
              <li
                class="ais-RelatedProducts-item"
              >
                {
          "objectID": "(2)"
        }
              </li>
            </ol>
          </div>
        </section>
      `);
    });

    test('renders with no results', async () => {
      const searchClient = createMockedSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          objectIDs: ['1'],
          // This simulates receiving no recommendations
          maxRecommendations: 0,
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(document.querySelector('.ais-RelatedProducts')).toBeNull();
    });
  });
}

function createMockedSearchClient() {
  return createSearchClient({
    getRecommendations: jest.fn((requests) =>
      Promise.resolve(
        createMultiSearchResponse(
          // @ts-ignore
          // `request` will be implicitly typed as `any` in type-check:v3
          // since `getRecommendations` is not available there
          ...requests.map((request) => {
            return createSingleSearchResponse<any>({
              hits:
                request.maxRecommendations === 0
                  ? []
                  : [{ objectID: '1' }, { objectID: '2' }],
            });
          })
        )
      )
    ) as SearchClient['getRecommendations'],
  });
}
