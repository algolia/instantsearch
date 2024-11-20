import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import {
  normalizeSnapshot as commonNormalizeSnapshot,
  wait,
} from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { skippableDescribe } from '../../common';

import type { HitsWidgetSetup } from '.';
import type { TestOptions } from '../../common';
import type { Hit, SearchResponse } from 'instantsearch.js';

function normalizeSnapshot(html: string) {
  // Each flavor has its own way to render the hit by default.
  // @MAJOR: Remove this once all flavors are aligned.
  return commonNormalizeSnapshot(html);
}

export function createOptionsTests(
  setup: HitsWidgetSetup,
  { act, skippedTests }: Required<TestOptions>
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
              <div
                style="word-break: break-all;"
              >
                {"objectID":"1","__position":1}…
              </div>
            </li>
            <li
              class="ais-Hits-item"
            >
              <div
                style="word-break: break-all;"
              >
                {"objectID":"2","__position":2}…
              </div>
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
              <div
                style="word-break: break-all;"
              >
                {"objectID":"(1)","__position":1}…
              </div>
            </li>
            <li
              class="ais-Hits-item"
            >
              <div
                style="word-break: break-all;"
              >
                {"objectID":"(2)","__position":2}…
              </div>
            </li>
          </ol>
        </div>
      `
      );
    });

    skippableDescribe('common rendering', skippedTests, () => {
      test('renders with no results', async () => {
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

        await act(async () => {
          userEvent.type(
            screen.getByRole('searchbox'),
            'query with no results'
          );
          await wait(0);
        });

        expect(
          document.querySelector('#hits-with-defaults .ais-Hits')
        ).toMatchNormalizedInlineSnapshot(
          normalizeSnapshot,
          `
          <div
            class="ais-Hits ais-Hits--empty"
          >
            <ol
              class="ais-Hits-list"
            />
          </div>
        `
        );
      });
    });

    test('renders default banner element with banner widget renderingContent', async () => {
      const searchClient = createMockedSearchClient({
        renderingContent: {
          // @TODO: remove once algoliasearch js client has been updated
          // @ts-expect-error
          widgets: {
            banners: [
              {
                image: {
                  urls: [{ url: 'https://via.placeholder.com/550x250' }],
                },
                link: {
                  url: 'https://www.algolia.com',
                },
              },
            ],
          },
        },
      });

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
          <aside
            class="ais-Hits-banner"
          >
            <a
              class="ais-Hits-banner-link"
              href="https://www.algolia.com"
            >
              <img
                class="ais-Hits-banner-image"
                src="https://via.placeholder.com/550x250"
              />
            </a>
          </aside>
          <ol
            class="ais-Hits-list"
          >
            <li
              class="ais-Hits-item"
            >
              <div
                style="word-break: break-all;"
              >
                {"objectID":"1","__position":1}…
              </div>
            </li>
            <li
              class="ais-Hits-item"
            >
              <div
                style="word-break: break-all;"
              >
                {"objectID":"2","__position":2}…
              </div>
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
