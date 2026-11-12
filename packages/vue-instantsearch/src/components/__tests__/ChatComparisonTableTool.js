/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { collectChatRecords } from 'instantsearch-core';

import { mount } from '../../../test/utils';
import { createComparisonTableTool } from '../chat/tools';

jest.unmock('instantsearch-core');

/**
 * The grounded comparison-table tool's `markdownTable` path: the agent
 * supplies only the objectIDs and the attribute KEYS — every cell is
 * hydrated from the chat records store, so the model cannot type (and cannot
 * hallucinate) a value. The renderer reads the message's output block, so the
 * tool key it is registered under is irrelevant here; the legacy
 * `algolia_display_results` key is used as in the eval study's wire shape.
 */
const buildComparisonContext = (searchHits, table) => {
  const message = {
    type: 'tool-algolia_display_results',
    state: 'output-available',
    toolCallId: 'display',
    input: {},
    output: {
      intro: table.intro,
      content: [
        {
          type: 'markdownTable',
          attributes: table.attributes,
          columns: table.columns,
          // Backend sends ONLY objectIDs per row — no attribute values.
          rows: table.objectIDs.map((objectID) => ({ objectID })),
        },
      ],
    },
  };

  const messages = [
    {
      id: '1',
      role: 'assistant',
      parts: [
        {
          type: 'tool-algolia_search_index',
          toolCallId: 'search',
          state: 'output-available',
          input: {},
          output: { hits: searchHits },
        },
        message,
      ],
    },
  ];

  return {
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
  };
};

describe('createComparisonTableTool', () => {
  let wrapper;

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
      wrapper = undefined;
    }
    document.body.innerHTML = '';
  });

  const mountTool = (context) => {
    const tool = createComparisonTableTool();
    wrapper = mount(tool.layoutComponent, {
      propsData: { context },
      attachTo: document.body,
    });
  };

  it('hydrates every cell from the retrieved catalog hits', () => {
    mountTool(
      buildComparisonContext(
        [
          { objectID: 'A', name: 'Galaxy A50', price: 199, rating: 4 },
          { objectID: 'B', name: 'OnePlus 6T', price: 299, rating: 5 },
        ],
        {
          attributes: ['price', 'rating'],
          columns: ['Phone', 'Price', 'Rating'],
          objectIDs: ['A', 'B'],
        }
      )
    );

    // Product names come from the hits, cells from the exact hit values.
    expect(document.querySelector('[data-testid="product-A"]')).toContainHTML(
      'Galaxy A50'
    );
    expect(document.querySelector('[data-testid="cell-A-0"]')).toContainHTML(
      '199'
    );
    expect(document.querySelector('[data-testid="cell-B-1"]')).toContainHTML(
      '5'
    );
  });

  it('renders an em-dash for a missing attribute, never a fabricated value', () => {
    mountTool(
      buildComparisonContext(
        [{ objectID: 'A', name: 'Galaxy A50', price: 199 }],
        { attributes: ['price', 'rating'], objectIDs: ['A'] }
      )
    );

    expect(document.querySelector('[data-testid="cell-A-1"]')).toContainHTML(
      '—'
    );
  });

  it('ignores values the model smuggled onto the display rows', () => {
    const context = buildComparisonContext(
      [{ objectID: 'A', name: 'Real Name', price: 10 }],
      { attributes: ['price'], objectIDs: ['A'] }
    );
    // A spoofed value on the display block's row — must be ignored.
    context.message.output.content[0].rows[0].name = 'FABRICATED';
    context.message.output.content[0].rows[0].price = 9999;

    mountTool(context);

    expect(document.querySelector('[data-testid="product-A"]')).toContainHTML(
      'Real Name'
    );
    expect(document.querySelector('[data-testid="cell-A-0"]')).toContainHTML(
      '10'
    );
    expect(document.body.textContent).not.toContain('FABRICATED');
    expect(document.body.textContent).not.toContain('9999');
  });

  it('renders nothing without a markdownTable block', () => {
    const context = buildComparisonContext(
      [{ objectID: 'A', name: 'Galaxy A50' }],
      { attributes: ['price'], objectIDs: ['A'] }
    );
    context.message.output.content = [];

    mountTool(context);

    expect(document.querySelector('table')).toBeNull();
  });
});
