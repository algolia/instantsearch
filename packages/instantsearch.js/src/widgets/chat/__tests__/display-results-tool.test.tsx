/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx h */
import { fireEvent, screen } from '@testing-library/dom';
import { h, render } from 'preact';

import { createDisplayResultsTool } from '../display-results-tool';

import type { ClientSideToolComponentProps } from 'instantsearch-ui-components';
import type { ComponentType } from 'preact';

describe('createDisplayResultsTool', () => {
  test('keeps item state while tool input streams', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const tool = createDisplayResultsTool({
      item: (_item, { html }) =>
        html`<input
          aria-label="Display result item"
          value="Original item value"
        />`,
    });
    const LayoutComponent = tool.templates
      .layout as unknown as ComponentType<ClientSideToolComponentProps>;
    const createToolProps = (intro: string): ClientSideToolComponentProps => {
      const message = {
        type: 'tool-algolia_display_results',
        toolCallId: 'display',
        state: 'input-streaming',
        input: {
          intro,
          groups: [
            {
              title: 'Products',
              results: [{ objectID: '1' }],
            },
          ],
        },
      } as ClientSideToolComponentProps['message'];

      return {
        message,
        messages: [
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
                  hits: [{ objectID: '1', name: 'Product 1' }],
                },
              },
              message,
            ],
          },
        ] as ClientSideToolComponentProps['messages'],
        indexUiState: {},
        setIndexUiState: jest.fn(),
        onClose: jest.fn(),
        addToolResult: jest.fn(),
        applyFilters: jest.fn(),
        sendEvent: jest.fn(),
      };
    };

    render(
      <LayoutComponent {...createToolProps('Original intro')} />,
      container
    );

    const inputBefore = screen.getByLabelText<HTMLInputElement>(
      'Display result item'
    );

    fireEvent.input(inputBefore, {
      target: { value: 'Edited during stream' },
    });
    inputBefore.focus();

    render(
      <LayoutComponent {...createToolProps('Updated intro')} />,
      container
    );

    const inputAfter = screen.getByLabelText<HTMLInputElement>(
      'Display result item'
    );

    expect(screen.getByText('Updated intro')).toBeInTheDocument();
    expect(inputAfter).toBe(inputBefore);
    expect(inputAfter).toHaveValue('Edited during stream');
    expect(document.activeElement).toBe(inputAfter);
  });
});
