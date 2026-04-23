/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { render, screen } from '@testing-library/react';
import React from 'react';

import { createDisplayResultsTool } from '../DisplayResultsTool';

import type {
  ChatMessageBase,
  ClientSideToolComponentProps,
} from 'instantsearch-ui-components';

type TestHit = {
  objectID: string;
  name: string;
  __position: number;
};

const mockItemComponent = ({
  item,
  why,
}: {
  item: TestHit;
  why?: string;
}) => (
  <div data-testid={`item-${item.objectID}`}>
    <span>{item.name}</span>
    {why && <small data-testid={`why-${item.objectID}`}>{why}</small>}
  </div>
);

const searchMessage: ChatMessageBase = {
  id: 'm1',
  role: 'assistant',
  parts: [
    {
      type: 'tool-algolia_search_index',
      toolCallId: 'search',
      state: 'output-available',
      input: { query: 'sneakers' },
      output: {
        hits: [
          { objectID: '1', name: 'Air Pegasus', __position: 1 },
          { objectID: '2', name: 'Chuck Taylor', __position: 2 },
        ],
      },
    } as ChatMessageBase['parts'][number],
  ],
};

describe('createDisplayResultsTool', () => {
  test('renders groups resolving objectIDs from prior search results', () => {
    const tool = createDisplayResultsTool<TestHit>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;

    const displayMessage: ClientSideToolComponentProps['message'] = {
      type: 'tool-algolia_display_results',
      state: 'output-available',
      toolCallId: 'display',
      input: {},
      output: {
        intro: 'Curated for you',
        groups: [
          {
            title: 'Runners',
            results: [{ objectID: '1', why: 'matches your stride' }],
          },
          {
            title: 'Casual',
            results: [{ objectID: '2', why: 'everyday classic' }],
          },
        ],
      },
    };

    render(
      <LayoutComponent
        message={displayMessage}
        messages={[
          searchMessage,
          {
            id: 'm2',
            role: 'assistant',
            parts: [displayMessage],
          },
        ]}
        applyFilters={jest.fn()}
        onClose={jest.fn()}
        indexUiState={{}}
        addToolResult={jest.fn()}
        setIndexUiState={jest.fn()}
        sendEvent={jest.fn()}
      />
    );

    expect(screen.getByText('Curated for you')).toBeInTheDocument();
    expect(screen.getByText('Air Pegasus')).toBeInTheDocument();
    expect(screen.getByText('Chuck Taylor')).toBeInTheDocument();
    expect(screen.getByTestId('why-1')).toHaveTextContent('matches your stride');
    expect(screen.getByTestId('why-2')).toHaveTextContent('everyday classic');
  });

  test('renders a streaming partial output with the preliminary flag', () => {
    const tool = createDisplayResultsTool<TestHit>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;

    // The chat lib parses tool-output-delta chunks into `output` before the UI
    // component ever sees the message, so the tool just reads whatever object
    // the lib has assembled so far and trusts `preliminary: true` as the only
    // streaming signal.
    render(
      <LayoutComponent
        message={
          {
            type: 'tool-algolia_display_results',
            state: 'output-available',
            toolCallId: 'display',
            input: {},
            output: {
              intro: 'Curating',
              groups: [
                { title: 'Runners', results: [{ objectID: '1' }] },
              ],
            },
            preliminary: true,
          } as ClientSideToolComponentProps['message']
        }
        messages={[searchMessage]}
        applyFilters={jest.fn()}
        onClose={jest.fn()}
        indexUiState={{}}
        addToolResult={jest.fn()}
        setIndexUiState={jest.fn()}
        sendEvent={jest.fn()}
      />
    );

    expect(screen.getByText('Curating')).toBeInTheDocument();
    expect(screen.getByText('Runners')).toBeInTheDocument();
    expect(screen.getByText('Air Pegasus')).toBeInTheDocument();
    // streaming caption appears while `preliminary: true`
    expect(screen.getByText('Curating results…')).toBeInTheDocument();
  });

  test('renders nothing when there are no groups to show', () => {
    const tool = createDisplayResultsTool<TestHit>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;

    const { container } = render(
      <LayoutComponent
        message={
          {
            type: 'tool-algolia_display_results',
            state: 'output-available',
            toolCallId: 'display',
            input: {},
            output: { intro: '', groups: [] },
          } as ClientSideToolComponentProps['message']
        }
        messages={[searchMessage]}
        applyFilters={jest.fn()}
        onClose={jest.fn()}
        indexUiState={{}}
        addToolResult={jest.fn()}
        setIndexUiState={jest.fn()}
        sendEvent={jest.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
