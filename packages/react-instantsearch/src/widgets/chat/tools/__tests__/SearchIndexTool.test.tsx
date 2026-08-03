/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { createCarouselTool } from '../SearchIndexTool';

import type { ClientSideToolComponentProps } from 'instantsearch-ui-components';

type TestHit = {
  objectID: string;
  name: string;
  __position: number;
};

const mockItemComponent = ({ item }: { item: TestHit }) => (
  <div data-testid={`item-${item.objectID}`}>{item.name}</div>
);

describe('createCarouselTool', () => {
  describe('SearchLayoutComponent', () => {
    test('renders Agent Studio search tool calls', () => {
      const tool = createCarouselTool<TestHit>(false, mockItemComponent);
      const LayoutComponent = tool.layoutComponent!;

      const message: ClientSideToolComponentProps['message'] = {
        type: 'tool-algolia_search_index',
        state: 'output-available',
        toolCallId: 'test-call-id',
        input: { query: 'test', number_of_results: 3 },
        output: {
          hits: [
            { objectID: '1', name: 'Product 1', __position: 1 },
            { objectID: '2', name: 'Product 2', __position: 2 },
          ],
          nbHits: 100,
        },
      };

      render(
        <LayoutComponent
          message={message}
          applyFilters={jest.fn()}
          onClose={jest.fn()}
          indexUiState={{}}
          addToolResult={jest.fn()}
          setIndexUiState={jest.fn()}
          sendEvent={jest.fn()}
        />
      );

      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });

    test('renders Algolia MCP Server search tool calls', () => {
      const tool = createCarouselTool<TestHit>(false, mockItemComponent);
      const LayoutComponent = tool.layoutComponent!;

      const message: ClientSideToolComponentProps['message'] = {
        type: 'tool-algolia_search_index_products',
        state: 'output-available',
        toolCallId: 'test-call-id',
        input: { query: 'test' },
        output: {
          hits: [
            { objectID: '1', name: 'MCP Product 1', __position: 1 },
            { objectID: '2', name: 'MCP Product 2', __position: 2 },
          ],
          nbHits: 50,
        },
      };

      render(
        <LayoutComponent
          message={message}
          applyFilters={jest.fn()}
          onClose={jest.fn()}
          indexUiState={{}}
          addToolResult={jest.fn()}
          setIndexUiState={jest.fn()}
          sendEvent={jest.fn()}
        />
      );

      expect(screen.getByText('MCP Product 1')).toBeInTheDocument();
      expect(screen.getByText('MCP Product 2')).toBeInTheDocument();
    });

    test.each([
      {
        shape: 'MCP `facet_<name>`',
        input: {
          query: '',
          facet_type: ['book'],
          facet_brand: [],
          facet_categories: ['Literature & Fiction', 'Teen & Young Adult'],
          facet__collections: [],
        },
        expected: {
          query: '',
          facetFilters: [
            ['type:book'],
            [
              'categories:Literature & Fiction',
              'categories:Teen & Young Adult',
            ],
          ],
        },
      },
      {
        shape: 'multi-query `queries`',
        input: {
          queries: [
            {
              query: 'laptop',
              facet_free_shipping: null,
              facet_type: null,
              facet_brand: null,
              facet_categories: ['Laptops'],
              'facet_hierarchicalCategories.lvl0': ['Computers & Tablets'],
              'facet_hierarchicalCategories.lvl1': [
                'Computers & Tablets > Laptops',
              ],
              'facet_hierarchicalCategories.lvl2': null,
              facet_price: null,
            },
          ],
          clickAnalytics: true,
          originalQuery: 'give me some laptops',
        },
        expected: {
          query: 'laptop',
          facetFilters: [
            ['categories:Laptops'],
            ['hierarchicalCategories.lvl0:Computers & Tablets'],
            ['hierarchicalCategories.lvl1:Computers & Tablets > Laptops'],
          ],
        },
      },
    ])(
      'refines the page from a $shape input on "View all"',
      async ({ input, expected }) => {
        const applyFilters = jest.fn().mockReturnValue({});
        const tool = createCarouselTool<TestHit>(true, mockItemComponent);
        const LayoutComponent = tool.layoutComponent!;

        const message: ClientSideToolComponentProps['message'] = {
          type: 'tool-algolia_search_index_products',
          state: 'output-available',
          toolCallId: 'test-call-id',
          input,
          output: {
            hits: [{ objectID: '1', name: 'Product 1', __position: 1 }],
            nbHits: 50,
          },
        };

        render(
          <LayoutComponent
            message={message}
            applyFilters={applyFilters}
            onClose={jest.fn()}
            indexUiState={{}}
            addToolResult={jest.fn()}
            setIndexUiState={jest.fn()}
            sendEvent={jest.fn()}
          />
        );

        await userEvent.click(screen.getByText('View all'));

        expect(applyFilters).toHaveBeenCalledWith(expected);
      }
    );
  });
});
