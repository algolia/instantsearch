/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { render, screen } from '@testing-library/react';
import React from 'react';

import { createDisplayResultsTool } from '../DisplayResultsTool';

import type { ClientSideToolComponentProps } from 'instantsearch-ui-components';

type TestHit = {
  objectID: string;
  name: string;
  __position: number;
};

const mockItemComponent = ({ item }: { item: TestHit }) => (
  <div data-testid={`item-${item.objectID}`}>{item.name}</div>
);

describe('createDisplayResultsTool', () => {
  test('renders intro and one carousel per group of hits', () => {
    const tool = createDisplayResultsTool<TestHit>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;

    const message: ClientSideToolComponentProps['message'] = {
      type: 'tool-algolia_display_results',
      state: 'output-available',
      toolCallId: 'display',
      input: {},
      output: {
        intro: 'Curated for you',
        groups: [
          {
            title: 'Runners',
            why: 'matches your stride',
            hits: [{ objectID: '1', name: 'Air Pegasus', __position: 1 }],
          },
          {
            title: 'Casual',
            hits: [{ objectID: '2', name: 'Chuck Taylor', __position: 1 }],
          },
        ],
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

    expect(screen.getByText('Curated for you')).toBeInTheDocument();
    expect(screen.getByText('Runners')).toBeInTheDocument();
    expect(screen.getByText('matches your stride')).toBeInTheDocument();
    expect(screen.getByText('Air Pegasus')).toBeInTheDocument();
    expect(screen.getByText('Casual')).toBeInTheDocument();
    expect(screen.getByText('Chuck Taylor')).toBeInTheDocument();
  });

  test('renders nothing when there are no groups and no intro', () => {
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
            output: { groups: [] },
          } as ClientSideToolComponentProps['message']
        }
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

  test('skips groups with no hits', () => {
    const tool = createDisplayResultsTool<TestHit>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;

    render(
      <LayoutComponent
        message={
          {
            type: 'tool-algolia_display_results',
            state: 'output-available',
            toolCallId: 'display',
            input: {},
            output: {
              groups: [
                { title: 'Empty', hits: [] },
                {
                  title: 'Full',
                  hits: [{ objectID: '1', name: 'Air Pegasus', __position: 1 }],
                },
              ],
            },
          } as ClientSideToolComponentProps['message']
        }
        applyFilters={jest.fn()}
        onClose={jest.fn()}
        indexUiState={{}}
        addToolResult={jest.fn()}
        setIndexUiState={jest.fn()}
        sendEvent={jest.fn()}
      />
    );

    expect(screen.queryByText('Empty')).not.toBeInTheDocument();
    expect(screen.getByText('Full')).toBeInTheDocument();
    expect(screen.getByText('Air Pegasus')).toBeInTheDocument();
  });
});
