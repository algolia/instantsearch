/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { render, screen } from '@testing-library/react';
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
        />
      );

      expect(screen.getByText('MCP Product 1')).toBeInTheDocument();
      expect(screen.getByText('MCP Product 2')).toBeInTheDocument();
    });
  });
});
