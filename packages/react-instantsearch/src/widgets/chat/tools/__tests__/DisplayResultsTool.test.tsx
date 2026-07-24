/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { render, screen } from '@testing-library/react';
import React from 'react';

import { createDisplayResultsTool } from '../DisplayResultsTool';

import type { ClientSideToolComponentProps } from 'instantsearch-ui-components';

type TestResult = {
  objectID: string;
  name?: string;
  __position: number;
  // Curation payload from the display tool, kept separate from record fields.
  __displayToolResult?: { objectID: string; why?: string };
};

const mockItemComponent = ({ item }: { item: TestResult }) => (
  <div data-testid={`item-${item.objectID}`}>
    <span>{item.objectID}</span>
    <span data-testid={`position-${item.objectID}`}>{item.__position}</span>
    {item.name && (
      <strong data-testid={`name-${item.objectID}`}>{item.name}</strong>
    )}
    {item.__displayToolResult?.why && (
      <small data-testid={`why-${item.objectID}`}>
        {item.__displayToolResult.why}
      </small>
    )}
  </div>
);

const createMessages = (
  message: ClientSideToolComponentProps['message'],
  hits: Array<{ objectID: string; name?: string; why?: string }>
): ClientSideToolComponentProps['messages'] =>
  [
    {
      id: '1',
      role: 'assistant',
      parts: [
        {
          type: 'tool-algolia_search_index',
          toolCallId: 'search',
          state: 'output-available',
          input: {},
          output: { hits },
        },
        message,
      ],
    },
  ] as ClientSideToolComponentProps['messages'];

describe('createDisplayResultsTool', () => {
  test('opts into tool input streaming', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);

    expect(tool.streamInput).toBe(true);
  });

  test('renders hydrated groups while tool input is streaming', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;

    const message: ClientSideToolComponentProps['message'] = {
      type: 'tool-algolia_display_results',
      state: 'input-streaming',
      toolCallId: 'display',
      input: {
        intro: 'Curating for you',
        groups: [
          {
            title: 'Runners',
            results: [{ objectID: '1', why: 'lightweight' }],
          },
        ],
      },
    };

    const messages = createMessages(message, [
      { objectID: '1', name: 'Air Runner' },
    ]);

    render(
      <LayoutComponent
        message={message}
        messages={messages}
        applyFilters={jest.fn()}
        onClose={jest.fn()}
        indexUiState={{}}
        addToolResult={jest.fn()}
        setIndexUiState={jest.fn()}
        sendEvent={jest.fn()}
      />
    );

    expect(screen.getByText('Curating for you')).toBeInTheDocument();
    expect(screen.getByText('Runners')).toBeInTheDocument();
    expect(screen.getByTestId('name-1')).toHaveTextContent('Air Runner');
    expect(screen.getByText('Curating results…')).toBeInTheDocument();
  });

  test('renders completed legacy v1 output when input has no v1 fields', () => {
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
        messages={createMessages(message, [
          { objectID: '1', name: 'Air Runner' },
          { objectID: '2', name: 'Street Runner' },
        ])}
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

  test('hydrates results from the preceding search tool, keeping display fields', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;

    const message: ClientSideToolComponentProps['message'] = {
      type: 'tool-algolia_display_results',
      state: 'output-available',
      toolCallId: 'display',
      input: {
        groups: [
          {
            title: 'Runners',
            // Backend only sends the objectID (and an optional `why`).
            results: [{ objectID: '1', why: 'iconic' }, { objectID: '2' }],
          },
        ],
      },
      output: { status: 'success', unknownObjectIds: [] },
    };

    // The preceding search tool (same assistant message) carries the full
    // records; the display tool hydrates from them.
    const messages = createMessages(message, [
      { objectID: '1', name: 'Air Runner', why: 'from search' },
      { objectID: '2', name: 'Trail Runner' },
    ]);

    render(
      <LayoutComponent
        message={message}
        messages={messages}
        applyFilters={jest.fn()}
        onClose={jest.fn()}
        indexUiState={{}}
        addToolResult={jest.fn()}
        setIndexUiState={jest.fn()}
        sendEvent={jest.fn()}
      />
    );

    // Full record fields are hydrated from the search hits…
    expect(screen.getByTestId('name-1')).toHaveTextContent('Air Runner');
    expect(screen.getByTestId('name-2')).toHaveTextContent('Trail Runner');
    // …while the display tool's curation payload stays in its own namespace,
    // so a record field named `why` ("from search") can't clobber it.
    expect(screen.getByTestId('why-1')).toHaveTextContent('iconic');
  });

  test('omits results when no matching hit is available', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;

    const message: ClientSideToolComponentProps['message'] = {
      type: 'tool-algolia_display_results',
      state: 'output-available',
      toolCallId: 'display',
      input: {
        groups: [
          { title: 'Runners', results: [{ objectID: '1', why: 'iconic' }] },
        ],
      },
      output: { status: 'success', unknownObjectIds: ['1'] },
    };

    const messages = createMessages(message, [
      { objectID: '99', name: 'Unrelated' },
    ]);

    render(
      <LayoutComponent
        message={message}
        messages={messages}
        applyFilters={jest.fn()}
        onClose={jest.fn()}
        indexUiState={{}}
        addToolResult={jest.fn()}
        setIndexUiState={jest.fn()}
        sendEvent={jest.fn()}
      />
    );

    expect(screen.queryByTestId('item-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('name-1')).not.toBeInTheDocument();
    expect(screen.queryByText('Runners')).not.toBeInTheDocument();
  });

  test('omits unresolved prototype-named object IDs', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;

    const message: ClientSideToolComponentProps['message'] = {
      type: 'tool-algolia_display_results',
      state: 'output-available',
      toolCallId: 'display',
      input: {
        groups: [
          {
            title: 'Runners',
            results: [
              { objectID: '1' },
              { objectID: 'constructor' },
              { objectID: '__proto__' },
              { objectID: '2' },
            ],
          },
          {
            title: 'Unknown only',
            results: [{ objectID: 'constructor' }],
          },
        ],
      },
      output: {
        status: 'warning',
        unknownObjectIds: ['constructor', '__proto__'],
      },
    };

    render(
      <LayoutComponent
        message={message}
        messages={createMessages(message, [
          { objectID: '1', name: 'Air Runner' },
          { objectID: '2', name: 'Trail Runner' },
        ])}
        applyFilters={jest.fn()}
        onClose={jest.fn()}
        indexUiState={{}}
        addToolResult={jest.fn()}
        setIndexUiState={jest.fn()}
        sendEvent={jest.fn()}
      />
    );

    expect(
      screen
        .getAllByTestId(/^item-/)
        .map((element) => element.getAttribute('data-testid'))
    ).toEqual(['item-1', 'item-2']);
    expect(screen.queryByTestId('item-constructor')).not.toBeInTheDocument();
    expect(screen.queryByTestId('item-__proto__')).not.toBeInTheDocument();
    expect(screen.queryByText('Unknown only')).not.toBeInTheDocument();
  });

  test('renders hydrated prototype-named object IDs', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;

    const message: ClientSideToolComponentProps['message'] = {
      type: 'tool-algolia_display_results',
      state: 'output-available',
      toolCallId: 'display',
      input: {
        groups: [
          {
            title: 'Reserved names',
            results: [{ objectID: 'constructor' }, { objectID: '__proto__' }],
          },
        ],
      },
      output: { status: 'success', unknownObjectIds: [] },
    };

    render(
      <LayoutComponent
        message={message}
        messages={createMessages(message, [
          { objectID: 'constructor', name: 'Constructor record' },
          { objectID: '__proto__', name: 'Prototype record' },
        ])}
        applyFilters={jest.fn()}
        onClose={jest.fn()}
        indexUiState={{}}
        addToolResult={jest.fn()}
        setIndexUiState={jest.fn()}
        sendEvent={jest.fn()}
      />
    );

    expect(screen.getByTestId('name-constructor')).toHaveTextContent(
      'Constructor record'
    );
    expect(screen.getByTestId('name-__proto__')).toHaveTextContent(
      'Prototype record'
    );
  });

  test('does not render preliminary legacy output', () => {
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
            output: {
              intro: 'Curating',
              groups: [{ title: 'Runners', results: [{ objectID: '1' }] }],
            },
            preliminary: true,
          } as ClientSideToolComponentProps['message']
        }
        messages={[]}
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

  test('drops results that are missing an objectID and skips groups with no valid results', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;
    const message = {
      type: 'tool-algolia_display_results',
      state: 'output-available',
      toolCallId: 'display',
      input: {
        groups: [
          { title: 'Empty', results: [{}, { objectID: '' }] },
          {
            title: 'Full',
            results: [{}, { objectID: '1', why: 'iconic' }],
          },
        ],
      },
      output: { status: 'success' },
    } as ClientSideToolComponentProps['message'];

    render(
      <LayoutComponent
        message={message}
        messages={createMessages(message, [
          { objectID: '1', name: 'Air Runner' },
        ])}
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

  test('keeps input authoritative when output contains diagnostics', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;

    const message: ClientSideToolComponentProps['message'] = {
      type: 'tool-algolia_display_results',
      state: 'output-available',
      toolCallId: 'display',
      input: {
        intro: 'Input intro',
        groups: [{ title: 'Input group', results: [{ objectID: '1' }] }],
      },
      output: {
        status: 'warning',
        unknownObjectIds: ['missing'],
      },
    };

    render(
      <LayoutComponent
        message={message}
        messages={createMessages(message, [
          { objectID: '1', name: 'Air Runner' },
        ])}
        applyFilters={jest.fn()}
        onClose={jest.fn()}
        indexUiState={{}}
        addToolResult={jest.fn()}
        setIndexUiState={jest.fn()}
        sendEvent={jest.fn()}
      />
    );

    expect(screen.getByText('Input intro')).toBeInTheDocument();
    expect(screen.getByText('Input group')).toBeInTheDocument();
    expect(screen.getByTestId('name-1')).toHaveTextContent('Air Runner');
    expect(screen.queryByText('warning')).not.toBeInTheDocument();
  });

  test('shows the streaming caption before a renderable input field arrives', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;

    render(
      <LayoutComponent
        message={
          {
            type: 'tool-algolia_display_results',
            state: 'input-streaming',
            toolCallId: 'display',
            input: {},
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

    expect(screen.getByText('Curating results…')).toBeInTheDocument();
  });

  test('does not expose legacy output when input claims malformed v1 fields', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;

    const { container } = render(
      <LayoutComponent
        message={
          {
            type: 'tool-algolia_display_results',
            state: 'output-available',
            toolCallId: 'display',
            input: { groups: 'invalid' },
            output: { intro: 'Legacy output' },
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

  test('preserves duplicate result order and uses the latest preceding hit', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;

    const message: ClientSideToolComponentProps['message'] = {
      type: 'tool-algolia_display_results',
      state: 'output-available',
      toolCallId: 'display',
      input: {
        groups: [
          {
            results: [
              { objectID: '1', why: 'first' },
              { objectID: '1', why: 'second' },
            ],
          },
        ],
      },
      output: { status: 'success' },
    };
    const messages = [
      {
        id: '1',
        role: 'assistant',
        parts: [
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'search-1',
            state: 'output-available',
            input: {},
            output: { hits: [{ objectID: '1', name: 'Old Runner' }] },
          },
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'search-2',
            state: 'output-available',
            input: {},
            output: { hits: [{ objectID: '1', name: 'New Runner' }] },
          },
          message,
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'search-after-display',
            state: 'output-available',
            input: {},
            output: { hits: [{ objectID: '1', name: 'Future Runner' }] },
          },
        ],
      },
    ] as ClientSideToolComponentProps['messages'];

    render(
      <LayoutComponent
        message={message}
        messages={messages}
        applyFilters={jest.fn()}
        onClose={jest.fn()}
        indexUiState={{}}
        addToolResult={jest.fn()}
        setIndexUiState={jest.fn()}
        sendEvent={jest.fn()}
      />
    );

    expect(screen.getAllByTestId('name-1')).toHaveLength(2);
    expect(screen.getAllByTestId('name-1')[0]).toHaveTextContent('New Runner');
    expect(screen.getAllByTestId('position-1')[0]).toHaveTextContent('1');
    expect(screen.getAllByTestId('position-1')[1]).toHaveTextContent('2');
    expect(screen.getAllByTestId('why-1')[0]).toHaveTextContent('first');
    expect(screen.getAllByTestId('why-1')[1]).toHaveTextContent('second');
  });
});
