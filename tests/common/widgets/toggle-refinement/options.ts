import { createSearchClient } from '@instantsearch/mocks';
import {
  normalizeSnapshot as commonNormalizeSnapshot,
  wait,
} from '@instantsearch/testutils';
import userEvent from '@testing-library/user-event';

import type { ToggleRefinementWidgetSetup } from '.';
import type { TestOptions } from '../../common';

function normalizeSnapshot(html: string) {
  return (
    commonNormalizeSnapshot(html)
      // Vue InstantSearch adds a `noRefinement` modifier on the root,
      // a `name`, and a `value` on the `input`.
      // @MAJOR: Remove this once Vue InstantSearch aligns with spec.
      .replace(/ ais-ToggleRefinement--noRefinement/g, '')
      .replace(/name="\w+"/g, '')
      .replace(/value="\w+"/g, '')
      .replace(/<input.+?>(\s+)/gs, (match) => match.trim())
      // Vue InstantSearch adds the count after the label if available.
      // @MAJOR: Remove this once Vue InstantSearch aligns with spec.
      .replace(
        /<span\n?\s*class="ais-ToggleRefinement-count"\n?\s*>\n?.*\s*<\/span>/g,
        ''
      )
      // React renders `checked` as `checked=""` through an attribute, other frameworks use the property.
      .replace(/checked=""/g, '')
  );
}

export function createOptionsTests(
  setup: ToggleRefinementWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('options', () => {
    test('renders with props', async () => {
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          attribute: 'free_shipping',
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-ToggleRefinement')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-ToggleRefinement"
        >
          <label
            class="ais-ToggleRefinement-label"
          >
            <input
              class="ais-ToggleRefinement-checkbox"
              type="checkbox"
            />
            <span
              class="ais-ToggleRefinement-labelText"
            >
              free_shipping
            </span>
          </label>
        </div>
      `
      );
    });

    test('renders with custom label', async () => {
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          attribute: 'free_shipping',
          // @ts-expect-error `label` is not part of the options for InstantSearch.js (it uses templates.labelText instead)
          label: 'Free Shipping!',
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-ToggleRefinement')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-ToggleRefinement"
        >
          <label
            class="ais-ToggleRefinement-label"
          >
            <input
              class="ais-ToggleRefinement-checkbox"
              type="checkbox"
            />
            <span
              class="ais-ToggleRefinement-labelText"
            >
              Free Shipping!
            </span>
          </label>
        </div>
      `
      );
    });

    test('renders checked when the attribute is refined', async () => {
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
          initialUiState: {
            indexName: {
              toggle: {
                free_shipping: true,
              },
            },
          },
        },
        widgetParams: {
          attribute: 'free_shipping',
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector<HTMLInputElement>(
          '.ais-ToggleRefinement-checkbox'
        )!.checked
      ).toBe(true);

      expect(
        document.querySelector('.ais-ToggleRefinement')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-ToggleRefinement"
        >
          <label
            class="ais-ToggleRefinement-label"
          >
            <input
              class="ais-ToggleRefinement-checkbox"
              type="checkbox"
            />
            <span
              class="ais-ToggleRefinement-labelText"
            >
              free_shipping
            </span>
          </label>
        </div>
      `
      );
    });

    test('toggles when clicking the checkbox', async () => {
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          attribute: 'free_shipping',
        },
      });

      await act(async () => {
        await wait(0);
      });

      const checkbox = document.querySelector<HTMLInputElement>(
        '.ais-ToggleRefinement-checkbox'
      )!;

      expect(checkbox.checked).toBe(false);

      userEvent.click(checkbox);

      await act(async () => {
        await wait(0);
      });

      expect(searchClient.search).toHaveBeenCalledTimes(2);
      expect(searchClient.search).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            params: {
              facetFilters: [['free_shipping:true']],
              facets: ['free_shipping'],
              tagFilters: '',
            },
          }),
        ])
      );
      expect(checkbox.checked).toBe(true);

      userEvent.click(checkbox);

      await act(async () => {
        await wait(0);
      });

      expect(searchClient.search).toHaveBeenCalledTimes(3);
      expect(searchClient.search).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            params: expect.objectContaining({
              facets: ['free_shipping'],
              tagFilters: '',
            }),
          }),
        ])
      );
      expect(checkbox.checked).toBe(false);
    });

    test('changes the value to filter on and off', async () => {
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          attribute: 'free_shipping',
          on: 'yes',
          off: 'no',
        },
      });

      await act(async () => {
        await wait(0);
      });

      const checkbox = document.querySelector<HTMLInputElement>(
        '.ais-ToggleRefinement-checkbox'
      )!;

      userEvent.click(checkbox);

      await act(async () => {
        await wait(0);
      });

      expect(checkbox).toBeChecked();
      expect(searchClient.search).toHaveBeenCalledTimes(2);
      expect(searchClient.search).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            params: {
              facetFilters: [['free_shipping:yes']],
              facets: ['free_shipping'],
              tagFilters: '',
            },
          }),
        ])
      );

      userEvent.click(checkbox);

      await act(async () => {
        await wait(0);
      });

      expect(checkbox).not.toBeChecked();
      expect(searchClient.search).toHaveBeenCalledTimes(3);
      expect(searchClient.search).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            params: expect.objectContaining({
              facetFilters: [['free_shipping:no']],
            }),
          }),
        ])
      );
    });
  });
}
