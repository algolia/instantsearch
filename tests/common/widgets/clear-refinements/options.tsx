import { createSearchClient } from '@instantsearch/mocks';
import { normalizeSnapshot, wait } from '@instantsearch/testutils';
import userEvent from '@testing-library/user-event';

import type { ClearRefinementsWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createOptionsTests(
  setup: ClearRefinementsWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('options', () => {
    test('renders with default props', async () => {
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
          initialUiState: {
            indexName: {
              refinementList: {
                brand: ['Apple'],
              },
            },
          },
        },
        widgetParams: {},
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-ClearRefinements')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-ClearRefinements"
        >
          <button
            class="ais-ClearRefinements-button"
          >
            Clear refinements
          </button>
        </div>
      `
      );
    });

    test('renders with a disabled button when there are no refinements', async () => {
      const searchClient = createSearchClient({});

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

      const button = document.querySelector('.ais-ClearRefinements-button');

      expect(button).toBeDisabled();
      expect(button).toHaveClass('ais-ClearRefinements-button--disabled');
      expect(
        document.querySelector('.ais-ClearRefinements')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-ClearRefinements"
        >
          <button
            class="ais-ClearRefinements-button ais-ClearRefinements-button--disabled"
            disabled=""
          >
            Clear refinements
          </button>
        </div>
      `
      );
    });

    test('clears all refinements', async () => {
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
          initialUiState: {
            indexName: {
              refinementList: {
                brand: ['Apple'],
              },
            },
          },
        },
        widgetParams: {},
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelectorAll('.ais-CurrentRefinements-item')
      ).toHaveLength(1);
      expect(
        document.querySelector('.ais-ClearRefinements')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-ClearRefinements"
        >
          <button
            class="ais-ClearRefinements-button"
          >
            Clear refinements
          </button>
        </div>
      `
      );

      userEvent.click(
        document.querySelector(
          '.ais-ClearRefinements-button'
        ) as HTMLButtonElement
      );

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelectorAll('.ais-CurrentRefinements-item')
      ).toHaveLength(0);

      expect(
        document.querySelector('.ais-ClearRefinements')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-ClearRefinements"
        >
          <button
            class="ais-ClearRefinements-button ais-ClearRefinements-button--disabled"
            disabled=""
          >
            Clear refinements
          </button>
        </div>
      `
      );
    });

    test('inclusively restricts what refinements to clear', async () => {
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
          initialUiState: {
            indexName: {
              refinementList: {
                brand: ['Apple'],
                categories: ['Audio'],
              },
            },
          },
        },
        widgetParams: {
          includedAttributes: ['categories'],
        },
      });

      await act(async () => {
        await wait(0);
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelectorAll('.ais-CurrentRefinements-item')
      ).toHaveLength(2);
      expect(
        document.querySelector('.ais-ClearRefinements')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-ClearRefinements"
        >
          <button
            class="ais-ClearRefinements-button"
          >
            Clear refinements
          </button>
        </div>
      `
      );

      userEvent.click(
        document.querySelector(
          '.ais-ClearRefinements-button'
        ) as HTMLButtonElement
      );

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelectorAll('.ais-CurrentRefinements-item')
      ).toHaveLength(1);

      expect(
        document.querySelectorAll('.ais-CurrentRefinements-item')[0]
      ).toHaveTextContent(/brand:Apple/i);
      expect(
        document.querySelector('.ais-ClearRefinements')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-ClearRefinements"
        >
          <button
            class="ais-ClearRefinements-button ais-ClearRefinements-button--disabled"
            disabled=""
          >
            Clear refinements
          </button>
        </div>
      `
      );
    });

    test('exclusively restricts what refinements to clear', async () => {
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
          initialUiState: {
            indexName: {
              refinementList: {
                brand: ['Apple'],
                categories: ['Audio'],
              },
            },
          },
        },
        widgetParams: {
          excludedAttributes: ['categories'],
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelectorAll('.ais-CurrentRefinements-item')
      ).toHaveLength(2);
      expect(
        document.querySelector('.ais-ClearRefinements')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-ClearRefinements"
        >
          <button
            class="ais-ClearRefinements-button"
          >
            Clear refinements
          </button>
        </div>
      `
      );

      userEvent.click(
        document.querySelector(
          '.ais-ClearRefinements-button'
        ) as HTMLButtonElement
      );

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelectorAll('.ais-CurrentRefinements-item')
      ).toHaveLength(1);

      expect(
        document.querySelectorAll('.ais-CurrentRefinements-item')[0]
      ).toHaveTextContent(/categories:Audio/i);
      expect(
        document.querySelector('.ais-ClearRefinements')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-ClearRefinements"
        >
          <button
            class="ais-ClearRefinements-button ais-ClearRefinements-button--disabled"
            disabled=""
          >
            Clear refinements
          </button>
        </div>
      `
      );
    });

    test('restricts what refinements to clear with custom logic', async () => {
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
          initialUiState: {
            indexName: {
              refinementList: {
                brand: ['Apple'],
                categories: ['Audio'],
              },
            },
          },
        },
        widgetParams: {
          transformItems: (items) => items.filter((item) => item !== 'brand'),
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelectorAll('.ais-CurrentRefinements-item')
      ).toHaveLength(2);
      expect(
        document.querySelector('.ais-ClearRefinements')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-ClearRefinements"
        >
          <button
            class="ais-ClearRefinements-button"
          >
            Clear refinements
          </button>
        </div>
      `
      );

      userEvent.click(
        document.querySelector(
          '.ais-ClearRefinements-button'
        ) as HTMLButtonElement
      );

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelectorAll('.ais-CurrentRefinements-item')
      ).toHaveLength(1);

      expect(
        document.querySelectorAll('.ais-CurrentRefinements-item')[0]
      ).toHaveTextContent(/brand:Apple/i);
      expect(
        document.querySelector('.ais-ClearRefinements')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-ClearRefinements"
        >
          <button
            class="ais-ClearRefinements-button ais-ClearRefinements-button--disabled"
            disabled=""
          >
            Clear refinements
          </button>
        </div>
      `
      );
    });
  });
}
