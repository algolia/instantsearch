import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import {
  normalizeSnapshot as commonNormalizeSnapshot,
  wait,
} from '@instantsearch/testutils';
import userEvent from '@testing-library/user-event';

import type { RangeInputWidgetSetup } from '.';
import type { TestOptions } from '../../common';

function normalizeSnapshot(html: string) {
  // React reflects the controlled inputs' empty value as an attribute.
  return commonNormalizeSnapshot(html).replace(/value=""/g, '');
}

export function createOptionsTests(
  setup: RangeInputWidgetSetup,
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
        document.querySelector('.ais-RangeInput')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-RangeInput"
        >
          <form
            class="ais-RangeInput-form"
          >
            <label
              class="ais-RangeInput-label"
            >
              <input
                class="ais-RangeInput-input ais-RangeInput-input--min"
                max="1000"
                min="1"
                placeholder="1"
                step="1"
                type="number"
              />
            </label>
            <span
              class="ais-RangeInput-separator"
            >
              to
            </span>
            <label
              class="ais-RangeInput-label"
            >
              <input
                class="ais-RangeInput-input ais-RangeInput-input--max"
                max="1000"
                min="1"
                placeholder="1000"
                step="1"
                type="number"
              />
            </label>
            <button
              class="ais-RangeInput-submit"
              type="submit"
            >
              Go
            </button>
          </form>
        </div>
      `
      );
    });

    test('disables the form when the attribute cannot be refined', async () => {
      const searchClient = createSearchClient({
        search: jest.fn((requests) =>
          Promise.resolve(
            createMultiSearchResponse(
              ...requests.map(() =>
                createSingleSearchResponse({
                  facets: { price: { 10: 1 } },
                  facets_stats: {
                    price: { min: 10, max: 10, avg: 10, sum: 10 },
                  },
                })
              )
            )
          )
        ),
      });

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

      expect(document.querySelector('.ais-RangeInput')).toHaveClass(
        'ais-RangeInput--noRefinement'
      );
      document
        .querySelectorAll('.ais-RangeInput-input')
        .forEach((input) => expect(input).toBeDisabled());
      expect(document.querySelector('.ais-RangeInput-submit')).toBeDisabled();
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

      expect(document.querySelector('.ais-RangeInput-input--min')).toHaveValue(
        100
      );
      expect(document.querySelector('.ais-RangeInput-input--max')).toHaveValue(
        200
      );
    });

    test('renders with precision', async () => {
      const searchClient = createMockedSearchClient();

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

      ['min', 'max'].forEach((target) => {
        expect(
          document.querySelector(`.ais-RangeInput-input--${target}`)
        ).toHaveAttribute('step', '0.01');
      });
    });

    test('refines on submit', async () => {
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

      const inputMin = document.querySelector('.ais-RangeInput-input--min')!;
      const inputMax = document.querySelector('.ais-RangeInput-input--max')!;
      const submit = document.querySelector('.ais-RangeInput-submit')!;

      userEvent.type(inputMin, '10');

      await act(async () => {
        await wait(0);
      });

      userEvent.click(submit);

      await act(async () => {
        await wait(0);
      });

      expect(searchClient.search).toHaveBeenCalledTimes(2);
      expect(searchClient.search).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            params: expect.objectContaining({
              numericFilters: ['price>=10'],
            }),
          }),
        ])
      );

      userEvent.clear(inputMin);
      userEvent.type(inputMax, '20');

      await act(async () => {
        await wait(0);
      });

      userEvent.click(submit);

      await act(async () => {
        await wait(0);
      });

      expect(searchClient.search).toHaveBeenCalledTimes(3);
      expect(searchClient.search).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            params: expect.objectContaining({
              numericFilters: ['price<=20'],
            }),
          }),
        ])
      );

      userEvent.clear(inputMin);
      userEvent.clear(inputMax);
      userEvent.type(inputMin, '100');
      userEvent.type(inputMax, '200');

      await act(async () => {
        await wait(0);
      });

      userEvent.click(submit);

      await act(async () => {
        await wait(0);
      });

      expect(searchClient.search).toHaveBeenCalledTimes(4);
      expect(searchClient.search).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            params: expect.objectContaining({
              numericFilters: ['price>=100', 'price<=200'],
            }),
          }),
        ])
      );
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
