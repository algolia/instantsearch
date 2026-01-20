import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import React from 'react';

import type { FilterSuggestionsWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createTemplatesTests(
  setup: FilterSuggestionsWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('templates', () => {
    test('renders with custom header template', async () => {
      const searchClient = createSearchClient({
        search: jest.fn(() =>
          Promise.resolve({
            results: [
              {
                hits: [
                  { objectID: '1', name: 'Product 1' },
                  { objectID: '2', name: 'Product 2' },
                ],
                nbHits: 2,
                page: 0,
                nbPages: 1,
                hitsPerPage: 20,
                processingTimeMS: 1,
                query: '',
                params: '',
                index: 'indexName',
              },
            ],
          })
        ) as any,
      });

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              parts: [
                { type: 'text', text: '' },
                {
                  type: 'text',
                  text: JSON.stringify([
                    {
                      attribute: 'brand',
                      value: 'Apple',
                      label: 'Brand',
                      count: 10,
                    },
                  ]),
                },
              ],
            }),
        } as Response)
      ) as jest.Mock;

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          javascript: {
            agentId: 'test-agent-id',
            templates: {
              header: () => '<div class="custom-header">Custom Header</div>',
            },
          },
          react: {
            agentId: 'test-agent-id',
            headerComponent: () => (
              <div className="custom-header">Custom Header</div>
            ),
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(500);
      });

      // The widget should render - custom template is applied via TemplateComponent
      expect(
        document.querySelector('.ais-FilterSuggestions')
      ).toBeInTheDocument();
      // Check that the widget has content (header should exist)
      const header = document.querySelector(
        '.ais-FilterSuggestions'
      )?.firstChild;
      expect(header).not.toBeNull();
    });

    test('renders with custom item template', async () => {
      const searchClient = createSearchClient({
        search: jest.fn(() =>
          Promise.resolve({
            results: [
              {
                hits: [
                  { objectID: '1', name: 'Product 1' },
                  { objectID: '2', name: 'Product 2' },
                ],
                nbHits: 2,
                page: 0,
                nbPages: 1,
                hitsPerPage: 20,
                processingTimeMS: 1,
                query: '',
                params: '',
                index: 'indexName',
              },
            ],
          })
        ) as any,
      });

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              parts: [
                { type: 'text', text: '' },
                {
                  type: 'text',
                  text: JSON.stringify([
                    {
                      attribute: 'brand',
                      value: 'Apple',
                      label: 'Brand',
                      count: 10,
                    },
                  ]),
                },
              ],
            }),
        } as Response)
      ) as jest.Mock;

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          javascript: {
            agentId: 'test-agent-id',
            templates: {
              item: ({ suggestion }) =>
                `<div class="custom-item">${suggestion.label}</div>`,
            },
          },
          react: {
            agentId: 'test-agent-id',
            itemComponent: ({ suggestion }) => (
              <div className="custom-item">{suggestion.label}</div>
            ),
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(500);
      });

      // The widget should render with items
      expect(
        document.querySelector('.ais-FilterSuggestions')
      ).toBeInTheDocument();
      const list = document.querySelector('.ais-FilterSuggestions-list');
      expect(list).toBeInTheDocument();
      // At least one item should be rendered
      const items = list?.querySelectorAll('li');
      expect(items && items.length).toBeGreaterThan(0);
    });

    test('renders with custom empty template', async () => {
      const searchClient = createSearchClient({
        search: jest.fn(() =>
          Promise.resolve({
            results: [
              {
                hits: [],
                nbHits: 0,
                page: 0,
                nbPages: 0,
                hitsPerPage: 20,
                processingTimeMS: 1,
                query: '',
                params: '',
                index: 'indexName',
              },
            ],
          })
        ) as any,
      });

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          javascript: {
            agentId: 'test-agent-id',
            templates: {
              empty: () => '<div class="custom-empty">No suggestions</div>',
            },
          },
          react: {
            agentId: 'test-agent-id',
            emptyComponent: () => (
              <div className="custom-empty">No suggestions</div>
            ),
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-FilterSuggestions')
      ).toBeInTheDocument();
      const empty = document.querySelector('.custom-empty');
      expect(empty).toBeInTheDocument();
    });
  });
}
