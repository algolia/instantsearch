import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import {
  normalizeSnapshot as commonNormalizeSnapshot,
  wait,
} from '@instantsearch/testutils';

import type { HitsWidgetSetup } from '.';
import type { TestOptions } from '../../common';
import type { Hit, SearchResponse } from 'instantsearch.js';

function normalizeSnapshot(html: string) {
  // Each flavor has its own way to render the hit by default.
  // @MAJOR: Remove this once all flavors are aligned.
  return commonNormalizeSnapshot(html)
    .replace(
      /(?:<div\s+style="word-break: break-all;"\s*?>)?\s*?({.+?})…?\s*?(?:<\/div>)?/gs,
      (_, captured) => {
        return (captured as string)
          .replace(/\s/g, '')
          .replace(/,"__position":\d/, '');
      }
    )
    .replace(/\s{0,}(objectID): (.+?), index: \d\s{0,}/gs, (_, ...captured) => {
      return `{"objectID":"${captured[1]}"}`;
    });
}

export function createOptionsTests(
  setup: HitsWidgetSetup,
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
        widgetParams: {},
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('#hits-with-defaults .ais-Hits')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-Hits"
        >
          <ol
            class="ais-Hits-list"
          >
            <li
              class="ais-Hits-item"
            >
              {"objectID":"1"}
            </li>
            <li
              class="ais-Hits-item"
            >
              {"objectID":"2"}
            </li>
          </ol>
        </div>
      `
      );
    });

    test('renders transformed items', async () => {
      const searchClient = createMockedSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          transformItems(items) {
            return (items as unknown as Array<Hit<CustomRecord>>).map(
              (item) => ({
                ...item,
                objectID: `(${item.objectID})`,
              })
            );
          },
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('#hits-with-defaults .ais-Hits')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-Hits"
        >
          <ol
            class="ais-Hits-list"
          >
            <li
              class="ais-Hits-item"
            >
              {"objectID":"(1)"}
            </li>
            <li
              class="ais-Hits-item"
            >
              {"objectID":"(2)"}
            </li>
          </ol>
        </div>
      `
      );
    });
  });
}

type CustomRecord = { name: string; description: string };

function createMockedSearchClient(
  subset: Partial<SearchResponse<CustomRecord>> = {}
) {
  return createSearchClient({
    search: jest.fn((requests) => {
      return Promise.resolve(
        createMultiSearchResponse(
          ...requests.map((request) => {
            return createSingleSearchResponse<any>({
              index: request.indexName,
              query: request.params?.query,
              hits:
                request.params?.query === 'query with no results'
                  ? []
                  : [{ objectID: '1' }, { objectID: '2' }],
              ...subset,
            });
          })
        )
      );
    }),
  });
}
