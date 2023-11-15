import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { normalizeSnapshot, wait } from '@instantsearch/testutils';

import type { StatsWidgetSetup } from '.';
import type { TestOptions } from '../../common';

function createMockedSearchClient(
  responseProps: {
    nbHits?: number;
    nbSortedHits?: number;
    processingTimeMS?: number;
  } = {}
) {
  return createSearchClient({
    search: jest.fn((requests) =>
      Promise.resolve(
        createMultiSearchResponse(
          ...requests.map((request) =>
            createSingleSearchResponse({
              index: request.indexName,
              nbHits: 1000,
              appliedRelevancyStrictness:
                typeof responseProps.nbSortedHits !== 'undefined' ? 1 : 0,
              nbSortedHits: 0,
              processingTimeMS: 10,
              ...responseProps,
            })
          )
        )
      )
    ),
  });
}

export function createOptionsTests(
  setup: StatsWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('options', () => {
    test('renders with 0 hits', async () => {
      const searchClient = createMockedSearchClient({ nbHits: 0 });

      await setup({
        instantSearchOptions: {
          indexName: 'instant_search',
          searchClient,
        },
        widgetParams: {},
      });

      await act(async () => {
        await wait(0);
      });

      expect(searchClient.search).toHaveBeenCalledTimes(1);

      expect(
        document.querySelector('.ais-Stats')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-Stats"
        >
          <span
            class="ais-Stats-text"
          >
            No results found in 10ms
          </span>
        </div>
      `
      );
    });

    test('renders with 1 hit', async () => {
      const searchClient = createMockedSearchClient({ nbHits: 1 });

      await setup({
        instantSearchOptions: {
          indexName: 'instant_search',
          searchClient,
        },
        widgetParams: {},
      });

      await act(async () => {
        await wait(0);
      });

      expect(document.querySelector('.ais-Stats-text')).toHaveTextContent(
        '1 result found in 10ms'
      );
    });

    test('renders with many hits and custom processingTimeMS', async () => {
      const searchClient = createMockedSearchClient({
        nbHits: 1000,
        processingTimeMS: 2,
      });

      await setup({
        instantSearchOptions: {
          indexName: 'instant_search',
          searchClient,
        },
        widgetParams: {},
      });

      await act(async () => {
        await wait(0);
      });

      expect(document.querySelector('.ais-Stats-text')).toHaveTextContent(
        '1,000 results found in 2ms'
      );
    });

    describe('with relevant sort', () => {
      test('renders with 0 sorted hits', async () => {
        const searchClient = createMockedSearchClient({ nbSortedHits: 0 });

        await setup({
          instantSearchOptions: {
            indexName: 'instant_search',
            searchClient,
          },
          widgetParams: {},
        });

        await act(async () => {
          await wait(0);
        });

        expect(document.querySelector('.ais-Stats-text')).toHaveTextContent(
          'No relevant results sorted out of 1,000 found in 10ms'
        );
      });

      test('renders with 1 sorted hit', async () => {
        const searchClient = createMockedSearchClient({ nbSortedHits: 1 });

        await setup({
          instantSearchOptions: {
            indexName: 'instant_search',
            searchClient,
          },
          widgetParams: {},
        });

        await act(async () => {
          await wait(0);
        });

        expect(document.querySelector('.ais-Stats-text')).toHaveTextContent(
          '1 relevant result sorted out of 1,000 found in 10ms'
        );
      });

      test('renders with many sorted hits and custom processingTimeMS', async () => {
        const searchClient = createMockedSearchClient({
          nbSortedHits: 500,
          processingTimeMS: 20,
        });

        await setup({
          instantSearchOptions: {
            indexName: 'instant_search',
            searchClient,
          },
          widgetParams: {},
        });

        await act(async () => {
          await wait(0);
        });

        expect(document.querySelector('.ais-Stats-text')).toHaveTextContent(
          '500 relevant results sorted out of 1,000 found in 20ms'
        );
      });

      test('renders with proper message when nbSortedHits equals nbHits', async () => {
        const searchClient = createMockedSearchClient({
          nbHits: 1000,
          nbSortedHits: 1000,
        });

        await setup({
          instantSearchOptions: {
            indexName: 'instant_search',
            searchClient,
          },
          widgetParams: {},
        });

        await act(async () => {
          await wait(0);
        });

        expect(document.querySelector('.ais-Stats-text')).toHaveTextContent(
          '1,000 results found in 10ms'
        );
      });
    });
  });
}
