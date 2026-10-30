import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { vueH } from '../chat/utils';

import type { CompareBarWidgetSetup } from '.';
import type { TestOptions } from '../../common';

const PRODUCTS = [
  { objectID: 'A', name: 'MacBook Pro 14' },
  { objectID: 'B', name: 'MacBook Pro 16' },
];

export function createTemplatesTests(
  setup: CompareBarWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('templates', () => {
    test('renders the item labels with a custom template', async () => {
      const shared = {
        configurationId: 'algolia_comparison_abc',
        products: PRODUCTS,
      };

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient({}),
        },
        widgetParams: {
          javascript: {
            ...shared,
            templates: {
              item: ({ item }, { html }) =>
                html`<span class="custom-item">Custom ${item.objectID}</span>`,
            },
          },
          react: {
            ...shared,
            itemComponent: ({ item }) => (
              <span className="custom-item">Custom {item.objectID}</span>
            ),
          },
          vue: {
            ...shared,
            slots: {
              item: ({ item }) =>
                vueH(
                  'span',
                  { class: 'custom-item' },
                  `Custom ${(item as { objectID: string }).objectID}`
                ),
            },
          },
        },
      });

      await act(async () => {
        await wait(0);
      });

      await act(async () => {
        userEvent.click(
          document.querySelector('[data-testid="CompareToggle-A"]')!
        );
        userEvent.click(
          document.querySelector('[data-testid="CompareToggle-B"]')!
        );
        await wait(0);
      });

      expect(
        Array.from(
          document.querySelectorAll('.ais-CompareBar-itemLabel .custom-item')
        ).map((label) => label.textContent)
      ).toEqual(['Custom A', 'Custom B']);
      // The remove buttons keep naming the record.
      expect(
        document.querySelector('.ais-CompareBar-itemRemove')
      ).toHaveAccessibleName('Remove MacBook Pro 14 from comparison');
    });
  });
}
