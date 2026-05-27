import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import {
  normalizeSnapshot as commonNormalizeSnapshot,
  wait,
} from '@instantsearch/testutils';

import type { RangeSliderWidgetSetup } from '.';
import type { TestOptions } from '../../common';

function normalizeSnapshot(html: string) {
  return commonNormalizeSnapshot(html)
    .replace(/style="[^"]*"/g, 'style="..."')
    .replace(/aria-valuenow="[^"]*"/g, 'aria-valuenow="..."');
}

export function createOptionsTests(
  setup: RangeSliderWidgetSetup,
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
        widgetParams: { attribute: 'price' },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-RangeSlider')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-RangeSlider"
        >
          <div
            class="rheostat rheostat-horizontal"
            style="..."
          >
            <div
              class="rheostat-background"
            />
            <div
              aria-disabled="false"
              aria-label="Minimum Filter Handle"
              aria-valuemax="1000"
              aria-valuemin="1"
              aria-valuenow="..."
              class="rheostat-handle rheostat-handle-lower"
              data-handle-key="0"
              role="slider"
              style="..."
              tabindex="0"
            >
              <div
                class="rheostat-tooltip"
              >
                1
              </div>
            </div>
            <div
              aria-disabled="false"
              aria-label="Maximum Filter Handle"
              aria-valuemax="1000"
              aria-valuemin="1"
              aria-valuenow="..."
              class="rheostat-handle rheostat-handle-upper"
              data-handle-key="1"
              role="slider"
              style="..."
              tabindex="0"
            >
              <div
                class="rheostat-tooltip"
              >
                1000
              </div>
            </div>
          </div>
        </div>
      `
      );
    });

    test('renders with initial refinements', async () => {
      const searchClient = createMockedSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
          initialUiState: {
            indexName: {
              range: {
                price: '100:200',
              },
            },
          },
        },
        widgetParams: { attribute: 'price' },
      });

      await act(async () => {
        await wait(0);
      });

      const tooltips = document.querySelectorAll('.rheostat-tooltip');
      expect(tooltips[0]).toHaveTextContent('100');
      expect(tooltips[1]).toHaveTextContent('200');
    });

    test('renders with precision', async () => {
      const searchClient = createSearchClient({
        search: jest.fn((requests) => {
          return Promise.resolve(
            createMultiSearchResponse(
              ...requests.map(() =>
                createSingleSearchResponse({
                  facets: {
                    price: {},
                  },
                  facets_stats: {
                    price: {
                      min: 1.5,
                      max: 10.75,
                      avg: 0,
                      sum: 0,
                    },
                  },
                })
              )
            )
          );
        }),
      });

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: { attribute: 'price', precision: 2 },
      });

      await act(async () => {
        await wait(0);
      });

      const tooltips = document.querySelectorAll('.rheostat-tooltip');
      expect(tooltips[0]).toHaveTextContent('1.5');
      expect(tooltips[1]).toHaveTextContent('10.75');
    });

    test('refines when dragging handles', async () => {
      const searchClient = createMockedSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: { attribute: 'price' },
      });

      await act(async () => {
        await wait(0);
      });

      expect(searchClient.search).toHaveBeenCalledTimes(1);
    });

    test('clamps refinement values to range limits', async () => {
      const searchClient = createMockedSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
          initialUiState: {
            indexName: {
              range: {
                price: '100:10000',
              },
            },
          },
        },
        widgetParams: { attribute: 'price' },
      });

      await act(async () => {
        await wait(0);
      });

      // The max value should be clamped to 1000 (the range max)
      const tooltips = document.querySelectorAll('.rheostat-tooltip');
      expect(tooltips[1]).toHaveTextContent('1000');
    });
  });
}

function createMockedSearchClient() {
  return createSearchClient({
    search: jest.fn((requests) => {
      return Promise.resolve(
        createMultiSearchResponse(
          ...requests.map(() =>
            createSingleSearchResponse({
              facets: {
                price: {},
              },
              facets_stats: {
                price: {
                  min: 1,
                  max: 1000,
                  avg: 0,
                  sum: 0,
                },
              },
            })
          )
        )
      );
    }),
  });
}
