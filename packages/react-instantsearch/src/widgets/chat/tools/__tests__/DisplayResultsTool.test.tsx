/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { render, screen } from '@testing-library/react';
import React from 'react';

import { createDisplayResultsTool } from '../DisplayResultsTool';

import type { ClientSideToolComponentProps } from 'instantsearch-core';

type TestResult = {
  objectID: string;
  why?: string;
  __position: number;
};

const mockItemComponent = ({ item }: { item: TestResult }) => (
  <div data-testid={`item-${item.objectID}`}>
    <span>{item.objectID}</span>
    {item.why && <small data-testid={`why-${item.objectID}`}>{item.why}</small>}
  </div>
);

describe('createDisplayResultsTool', () => {
  test('renders intro and one carousel per group, passing results straight through', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
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
            results: [{ objectID: '1', why: 'iconic' }],
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
    expect(screen.getByText('Casual')).toBeInTheDocument();
    expect(screen.getByTestId('why-1')).toHaveTextContent('iconic');
    expect(screen.getByTestId('why-2')).toHaveTextContent('everyday classic');
  });

  test('shows streaming caption while preliminary flag is true', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
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
              intro: 'Curating',
              groups: [
                { title: 'Runners', results: [{ objectID: '1' }] },
              ],
            },
            preliminary: true,
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

    expect(screen.getByText('Curating')).toBeInTheDocument();
    expect(screen.getByText('Runners')).toBeInTheDocument();
    expect(screen.getByTestId('item-1')).toBeInTheDocument();
    expect(screen.getByText('Curating results…')).toBeInTheDocument();
  });

  test('drops results that are missing an objectID and skips groups with no valid results', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
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
                { title: 'Empty', results: [{}, { objectID: '' }] },
                {
                  title: 'Full',
                  results: [{}, { objectID: '1', why: 'iconic' }],
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
    expect(screen.getByTestId('item-1')).toBeInTheDocument();
  });

  test('renders nothing when there are no groups and no intro', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
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
});
