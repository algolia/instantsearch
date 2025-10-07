import { createSearchClient } from '@instantsearch/mocks';
import { normalizeSnapshot, wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import type { HitsPerPageWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createOptionsTests(
  setup: HitsPerPageWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('options', () => {
    test('renders with required props', async () => {
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          items: [
            { label: '10', value: 10, default: true },
            { label: '20', value: 20 },
            { label: '30', value: 30 },
          ],
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-HitsPerPage')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-HitsPerPage"
        >
          <select
            aria-label="Items per page"
            class="ais-HitsPerPage-select"
          >
            <option
              class="ais-HitsPerPage-option"
              value="10"
            >
              10
            </option>
            <option
              class="ais-HitsPerPage-option"
              value="20"
            >
              20
            </option>
            <option
              class="ais-HitsPerPage-option"
              value="30"
            >
              30
            </option>
          </select>
        </div>
      `
      );

      // The `default` item isn't the first one
      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          items: [
            { label: '10', value: 10 },
            { label: '20', value: 20, default: true },
            { label: '30', value: 30 },
          ],
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-HitsPerPage')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-HitsPerPage"
        >
          <select
            aria-label="Items per page"
            class="ais-HitsPerPage-select"
          >
            <option
              class="ais-HitsPerPage-option"
              value="10"
            >
              10
            </option>
            <option
              class="ais-HitsPerPage-option"
              value="20"
            >
              20
            </option>
            <option
              class="ais-HitsPerPage-option"
              value="30"
            >
              30
            </option>
          </select>
        </div>
      `
      );
    });

    test('transforms the items', async () => {
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          items: [
            { label: '10', value: 10, default: true },
            { label: '20', value: 20 },
            { label: '30', value: 30 },
          ],
          transformItems: (items) =>
            items.map((item) => ({ ...item, label: `${item.label} items` })),
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        [...document.querySelectorAll('.ais-HitsPerPage-option')].map((item) =>
          item.textContent?.trim()
        )
      ).toEqual(['10 items', '20 items', '30 items']);
    });

    test('selects current value', async () => {
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          initialUiState: {
            indexName: {
              hitsPerPage: 20,
            },
          },
          searchClient,
        },
        widgetParams: {
          items: [
            { label: '10', value: 10, default: true },
            { label: '20', value: 20 },
            { label: '30', value: 30 },
          ],
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        screen.getByRole<HTMLOptionElement>('option', { name: '10' }).selected
      ).toBe(false);
      expect(
        screen.getByRole<HTMLOptionElement>('option', { name: '20' }).selected
      ).toBe(true);
      expect(
        screen.getByRole<HTMLOptionElement>('option', { name: '30' }).selected
      ).toBe(false);
    });

    test('refines on select', async () => {
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          items: [
            { label: '10', value: 10, default: true },
            { label: '20', value: 20 },
            { label: '30', value: 30 },
          ],
        },
      });

      await act(async () => {
        await wait(0);
      });

      userEvent.selectOptions(
        document.querySelector('.ais-HitsPerPage-select')!,
        ['30']
      );

      expect(searchClient.search).toHaveBeenCalledTimes(2);
      expect(searchClient.search).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            params: expect.objectContaining({
              hitsPerPage: 30,
            }),
          }),
        ])
      );
    });
  });
}
