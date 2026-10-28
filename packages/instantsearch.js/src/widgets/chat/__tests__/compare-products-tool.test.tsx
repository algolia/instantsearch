/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx h */
import { chatToolProps } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';
import { collectChatRecords } from 'instantsearch-ui-components';
import { h, render } from 'preact';

import { createCompareProductsTool } from '../compare-products-tool';

import type {
  ChatComponentContext,
  ClientSideToolComponentProps,
} from 'instantsearch-ui-components';
import type { ComponentType } from 'preact';

const createToolProps = (): ClientSideToolComponentProps => {
  const message = {
    type: 'tool-algolia_compare_products',
    toolCallId: 'compare',
    state: 'input-available',
    input: {
      objectIDs: ['1', '2'],
      criteria: [{ label: 'Price', values: ['$10', '$20'] }],
    },
  } as ClientSideToolComponentProps['context']['message'];

  const messages = [
    {
      id: 'assistant-message-id',
      role: 'assistant',
      parts: [
        {
          type: 'tool-algolia_search_index',
          toolCallId: 'search',
          state: 'output-available',
          input: { query: 'products' },
          output: {
            hits: ['1', '2'].map((objectID) => ({
              objectID,
              name: `Product ${objectID}`,
            })),
          },
        },
        message,
      ],
    },
  ] as ChatComponentContext['messages'];

  return chatToolProps({
    messages,
    status: 'ready',
    isClearing: false,
    open: true,
    maximized: false,
    tools: {},
    regenerate: jest.fn(),
    stop: jest.fn(),
    onReload: jest.fn(),
    onClose: jest.fn(),
    message,
    records: collectChatRecords(messages),
    indexUiState: {},
    setIndexUiState: jest.fn(),
    addToolResult: jest.fn(),
    applyFilters: jest.fn(),
    sendEvent: jest.fn(),
  });
};

function renderTool(tool: ReturnType<typeof createCompareProductsTool>) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const LayoutComponent = tool.templates
    .layout as unknown as ComponentType<ClientSideToolComponentProps>;

  render(<LayoutComponent {...createToolProps()} />, container);
}

describe('createCompareProductsTool', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  test('renders the product headers with the item template when provided', () => {
    renderTool(
      createCompareProductsTool({
        item: (item, { html }) =>
          html`<article data-testid="card-${item.objectID}">
            ${item.name} card
          </article>`,
      })
    );

    expect(screen.getByTestId('card-1')).toHaveTextContent('Product 1 card');
    expect(screen.getByTestId('product-2')).toContainElement(
      screen.getByTestId('card-2')
    );
    expect(screen.getByTestId('cell-1-0')).toHaveTextContent('$10');
  });

  test('falls back to the record name without an item template', () => {
    // The chat widget passes no templates when the merchant did not provide an
    // `item` template, so the header shows the name rather than a JSON dump.
    renderTool(createCompareProductsTool());

    expect(screen.getByTestId('product-1')).toHaveTextContent('Product 1');
    expect(screen.getByTestId('product-2')).toHaveTextContent('Product 2');
    expect(screen.queryByText(/"objectID"/)).not.toBeInTheDocument();
  });

  test('renders while the tool input streams', () => {
    // The table grows as the arguments arrive (columns, then rows); the
    // connector only repairs partial input for tools that opt in.
    expect(createCompareProductsTool().streamInput).toBe(true);
  });
});
