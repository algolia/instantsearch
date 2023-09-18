import { createAlgoliaSearchClient } from '@instantsearch/mocks';
import {
  normalizeSnapshot as commonNormalizeSnapshot,
  wait,
} from '@instantsearch/testutils';
import { queryByText } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import type { CurrentRefinementsWidgetSetup } from '.';
import type { TestOptions } from '../../common';

function normalizeSnapshot(html: string) {
  // React InstantSearch adds a noRefinement modifier on the list.
  // @MAJOR: Remove this once React InstantSearch aligns with spec.
  return commonNormalizeSnapshot(html).replace(
    / ais-CurrentRefinements-list--noRefinement/g,
    ''
  );
}

export function createOptionsTests(
  setup: CurrentRefinementsWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('options', () => {
    const searchClient = createAlgoliaSearchClient({});
    const onSubmitListener = jest.fn();

    beforeEach(() => {
      searchClient.search.mockClear();

      document.body.addEventListener('submit', onSubmitListener);
    });

    it('renders with refinements', async () => {
      await setup({
        instantSearchOptions: {
          searchClient,
          indexName: 'indexName',
          initialUiState: {
            indexName: {
              refinementList: {
                feature: ['5G', 'OLED Display'],
                brand: ['Samsung', 'Apple'],
              },
              hierarchicalMenu: {
                'hierarchicalCategories.lvl0': ['Cell Phones'],
              },
              range: {
                price: '500:990',
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
      ).toHaveLength(4);

      expect(
        document.querySelectorAll('.ais-CurrentRefinements-category')
      ).toHaveLength(7);

      expect(
        document.querySelector('.ais-CurrentRefinements')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-CurrentRefinements"
        >
          <ul
            class="ais-CurrentRefinements-list"
          >
            <li
              class="ais-CurrentRefinements-item"
            >
              <span
                class="ais-CurrentRefinements-label"
              >
                Feature: 
              </span>
              <span
                class="ais-CurrentRefinements-category"
              >
                <span
                  class="ais-CurrentRefinements-categoryLabel"
                >
                  5G
                </span>
                <button
                  class="ais-CurrentRefinements-delete"
                  type="button"
                >
                  ✕
                </button>
              </span>
              <span
                class="ais-CurrentRefinements-category"
              >
                <span
                  class="ais-CurrentRefinements-categoryLabel"
                >
                  OLED Display
                </span>
                <button
                  class="ais-CurrentRefinements-delete"
                  type="button"
                >
                  ✕
                </button>
              </span>
            </li>
            <li
              class="ais-CurrentRefinements-item"
            >
              <span
                class="ais-CurrentRefinements-label"
              >
                Brand: 
              </span>
              <span
                class="ais-CurrentRefinements-category"
              >
                <span
                  class="ais-CurrentRefinements-categoryLabel"
                >
                  Apple
                </span>
                <button
                  class="ais-CurrentRefinements-delete"
                  type="button"
                >
                  ✕
                </button>
              </span>
              <span
                class="ais-CurrentRefinements-category"
              >
                <span
                  class="ais-CurrentRefinements-categoryLabel"
                >
                  Samsung
                </span>
                <button
                  class="ais-CurrentRefinements-delete"
                  type="button"
                >
                  ✕
                </button>
              </span>
            </li>
            <li
              class="ais-CurrentRefinements-item"
            >
              <span
                class="ais-CurrentRefinements-label"
              >
                HierarchicalCategories.lvl0: 
              </span>
              <span
                class="ais-CurrentRefinements-category"
              >
                <span
                  class="ais-CurrentRefinements-categoryLabel"
                >
                  Cell Phones
                </span>
                <button
                  class="ais-CurrentRefinements-delete"
                  type="button"
                >
                  ✕
                </button>
              </span>
            </li>
            <li
              class="ais-CurrentRefinements-item"
            >
              <span
                class="ais-CurrentRefinements-label"
              >
                Price: 
              </span>
              <span
                class="ais-CurrentRefinements-category"
              >
                <span
                  class="ais-CurrentRefinements-categoryLabel"
                >
                  ≥ 500
                </span>
                <button
                  class="ais-CurrentRefinements-delete"
                  type="button"
                >
                  ✕
                </button>
              </span>
              <span
                class="ais-CurrentRefinements-category"
              >
                <span
                  class="ais-CurrentRefinements-categoryLabel"
                >
                  ≤ 990
                </span>
                <button
                  class="ais-CurrentRefinements-delete"
                  type="button"
                >
                  ✕
                </button>
              </span>
            </li>
          </ul>
        </div>
      `
      );
    });

    it('renders with no refinements', async () => {
      await setup({
        instantSearchOptions: {
          searchClient,
          indexName: 'indexName',
        },
        widgetParams: {},
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-CurrentRefinements')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-CurrentRefinements ais-CurrentRefinements--noRefinement"
        >
          <ul
            class="ais-CurrentRefinements-list"
          />
        </div>
      `
      );
    });

    it('clears a refinement', async () => {
      await setup({
        instantSearchOptions: {
          searchClient,
          indexName: 'indexName',
          initialUiState: {
            indexName: {
              refinementList: {
                brand: ['Apple', 'Samsung'],
                feature: ['5G'],
              },
            },
          },
        },
        widgetParams: {},
      });

      await act(async () => {
        await wait(0);
      });

      const container = document.querySelector<HTMLElement>(
        '.ais-CurrentRefinements'
      )!;

      const [btn5G, btnApple, btnSamsung] = document.querySelectorAll(
        '.ais-CurrentRefinements-delete'
      );

      await act(async () => {
        userEvent.click(btn5G);
        await wait(0);
      });
      expect(queryByText(container, 'Apple')).not.toBeNull();
      expect(queryByText(container, 'Samsung')).not.toBeNull();
      expect(queryByText(container, '5G')).toBeNull();

      await act(async () => {
        userEvent.click(btnApple);
        await wait(0);
      });
      expect(queryByText(container, 'Apple')).toBeNull();
      expect(queryByText(container, 'Samsung')).not.toBeNull();
      expect(queryByText(container, '5G')).toBeNull();

      await act(async () => {
        userEvent.click(btnSamsung);
        await wait(0);
      });
      expect(queryByText(container, 'Apple')).toBeNull();
      expect(queryByText(container, 'Samsung')).toBeNull();
      expect(queryByText(container, '5G')).toBeNull();

      expect(
        document.querySelectorAll('.ais-CurrentRefinements-item')
      ).toHaveLength(0);
      expect(
        document.querySelectorAll('.ais-CurrentRefinements-category')
      ).toHaveLength(0);
    });

    it('does not trigger default event', async () => {
      await setup({
        instantSearchOptions: {
          searchClient,
          indexName: 'indexName',
          initialUiState: {
            indexName: {
              refinementList: {
                brand: ['Apple', 'Samsung'],
                feature: ['5G'],
              },
            },
          },
        },
        widgetParams: {},
      });

      await act(async () => {
        await wait(0);
      });

      expect(searchClient.search).toHaveBeenCalledTimes(1);

      const form = document.querySelector<HTMLFormElement>('form')!;
      const currentRefinements = document.querySelector<HTMLElement>(
        '.ais-CurrentRefinements'
      )!;
      expect(form).toContainElement(currentRefinements);

      await act(async () => {
        userEvent.click(
          document.querySelector<HTMLButtonElement>(
            '.ais-CurrentRefinements-delete'
          )!
        );
        await wait(0);
      });

      expect(onSubmitListener).not.toHaveBeenCalled();
    });

    it('does not clear when pressing a modifier key', async () => {
      await setup({
        instantSearchOptions: {
          searchClient,
          indexName: 'indexName',
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

      const button = document.querySelector<HTMLButtonElement>(
        '.ais-CurrentRefinements-delete'
      )!;

      await act(async () => {
        userEvent.click(button, { button: 1 });
        userEvent.click(button, { altKey: true });
        userEvent.click(button, { ctrlKey: true });
        userEvent.click(button, { metaKey: true });
        userEvent.click(button, { shiftKey: true });

        await wait(0);
      });

      expect(
        document.querySelectorAll('.ais-CurrentRefinements-item')
      ).toHaveLength(1);
    });

    it('inclusively restricts what refinements to display', async () => {
      await setup({
        instantSearchOptions: {
          searchClient,
          indexName: 'indexName',
          initialUiState: {
            indexName: {
              query: 'iPhone',
              refinementList: {
                brand: ['Apple'],
                feature: ['5G'],
              },
            },
          },
        },
        widgetParams: {
          includedAttributes: ['feature', 'query'],
        },
      });

      await act(async () => {
        await wait(0);
      });

      const container = document.querySelector<HTMLElement>(
        '.ais-CurrentRefinements'
      )!;

      expect(queryByText(container, 'Apple')).toBeNull();
      expect(queryByText(container, '5G')).not.toBeNull();
      expect(queryByText(container, 'iPhone')).not.toBeNull();
    });

    it('exclusively restricts what refinements to display', async () => {
      await setup({
        instantSearchOptions: {
          searchClient,
          indexName: 'indexName',
          initialUiState: {
            indexName: {
              query: 'iPhone',
              refinementList: {
                brand: ['Apple'],
                feature: ['5G'],
              },
            },
          },
        },
        widgetParams: {
          excludedAttributes: ['brand', 'query'],
        },
      });

      await act(async () => {
        await wait(0);
      });

      const container = document.querySelector<HTMLElement>(
        '.ais-CurrentRefinements'
      )!;
      expect(queryByText(container, 'Apple')).toBeNull();
      expect(queryByText(container, '5G')).not.toBeNull();
      expect(queryByText(container, 'iPhone')).toBeNull();
    });

    it('restricts what refinements to display with custom logic', async () => {
      await setup({
        instantSearchOptions: {
          searchClient,
          indexName: 'indexName',
          initialUiState: {
            indexName: {
              refinementList: {
                brand: ['Apple'],
                feature: ['5G'],
              },
            },
          },
        },
        widgetParams: {
          transformItems: (items) =>
            items.filter((item) => item.attribute !== 'brand'),
        },
      });

      await act(async () => {
        await wait(0);
      });

      const container = document.querySelector<HTMLElement>(
        '.ais-CurrentRefinements'
      )!;
      expect(queryByText(container, 'Apple')).toBeNull();
      expect(queryByText(container, '5G')).not.toBeNull();
    });
  });
}
