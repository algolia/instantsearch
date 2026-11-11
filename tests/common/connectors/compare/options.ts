import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import userEvent from '@testing-library/user-event';

import type { CompareConnectorSetup, CompareConnectorSetupParams } from '.';
import type { TestOptions } from '../../common';

const CONFIGURATION_ID = 'algolia_comparison_abc';

const PRODUCTS = [
  { objectID: 'A', name: 'MacBook Pro 14' },
  { objectID: 'B', name: 'MacBook Pro 16' },
  { objectID: 'C', name: 'MacBook Air' },
  { objectID: 'D', name: 'ThinkPad X1' },
];

function byTestId(testId: string) {
  return document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;
}

function getItemIds() {
  return Array.from(
    document.querySelectorAll('[data-testid="Compare-item"]')
  ).map((item) => item.getAttribute('data-object-id'));
}

function sseResponse(chunks: Array<Record<string, unknown>>): Response {
  const body = chunks
    .map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`)
    .join('');
  return new Response(`${body}data: [DONE]`, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

/**
 * Mocks `global.fetch` (the Agent Studio transport, not the search client)
 * with a streamed answer.
 */
function mockAgentFetch() {
  const fetchMock = jest.fn(() =>
    Promise.resolve(
      sseResponse([
        { type: 'start', messageId: 'assistant-1' },
        { type: 'text-start', id: 't1' },
        { type: 'text-delta', id: 't1', delta: 'Here is the comparison.' },
        { type: 'text-end', id: 't1' },
        { type: 'finish' },
      ])
    )
  );
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

export function createOptionsTests(
  setup: CompareConnectorSetup,
  { act }: Required<TestOptions>
) {
  async function render(params: Partial<CompareConnectorSetupParams> = {}) {
    await setup({
      instantSearchOptions: {
        indexName: 'indexName',
        searchClient: createSearchClient({}),
      },
      widgetParams: {
        configurationId: CONFIGURATION_ID,
        products: PRODUCTS,
        ...params,
      },
    });

    await act(async () => {
      await wait(0);
    });
  }

  async function click(testId: string) {
    await act(async () => {
      userEvent.click(byTestId(testId));
      await wait(0);
    });
  }

  describe('options', () => {
    test('starts with an empty selection and the default limits', async () => {
      await render();

      expect(getItemIds()).toEqual([]);
      expect(byTestId('Compare-minItems')).toHaveTextContent('2');
      expect(byTestId('Compare-maxItems')).toHaveTextContent('3');
      expect(byTestId('Compare-canAddItems')).toHaveTextContent('true');
      expect(byTestId('Compare-canCompare')).toHaveTextContent('false');
    });

    test('exposes the custom `minItems` and `maxItems`', async () => {
      await render({ minItems: 3, maxItems: 4 });

      expect(byTestId('Compare-minItems')).toHaveTextContent('3');
      expect(byTestId('Compare-maxItems')).toHaveTextContent('4');
    });

    test('throws without `configurationId`', async () => {
      await expect(async () => {
        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient: createSearchClient({}),
          },
          widgetParams: {} as CompareConnectorSetupParams,
        });
      }).rejects.toThrow('The `configurationId` option is required.');
    });

    test('throws when `minItems` is lower than 2', async () => {
      await expect(async () => {
        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient: createSearchClient({}),
          },
          widgetParams: { configurationId: CONFIGURATION_ID, minItems: 1 },
        });
      }).rejects.toThrow('The `minItems` option must be at least 2.');
    });

    test('throws when `maxItems` is lower than `minItems`', async () => {
      await expect(async () => {
        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient: createSearchClient({}),
          },
          widgetParams: {
            configurationId: CONFIGURATION_ID,
            minItems: 3,
            maxItems: 2,
          },
        });
      }).rejects.toThrow(
        'The `maxItems` option must be greater than or equal to `minItems`.'
      );
    });

    test('adds items in insertion order and ignores duplicates', async () => {
      await render();

      await click('Compare-add-B');
      await click('Compare-add-A');
      await click('Compare-add-B');

      expect(getItemIds()).toEqual(['B', 'A']);
      expect(byTestId('Compare-toggle-A')).toHaveAttribute(
        'aria-pressed',
        'true'
      );
      expect(byTestId('Compare-toggle-C')).toHaveAttribute(
        'aria-pressed',
        'false'
      );
    });

    test('removes an item, and ignores items that are not selected', async () => {
      await render();

      await click('Compare-add-A');
      await click('Compare-add-B');
      await click('Compare-remove-C');

      expect(getItemIds()).toEqual(['A', 'B']);

      await click('Compare-remove-A');

      expect(getItemIds()).toEqual(['B']);
    });

    test('toggles items', async () => {
      await render();

      await click('Compare-toggle-A');
      await click('Compare-toggle-B');

      expect(getItemIds()).toEqual(['A', 'B']);

      await click('Compare-toggle-A');

      expect(getItemIds()).toEqual(['B']);
    });

    test('clears the selection', async () => {
      await render();

      await click('Compare-add-A');
      await click('Compare-add-B');
      await click('Compare-clear');

      expect(getItemIds()).toEqual([]);
      expect(byTestId('Compare-toggle-A')).toHaveAttribute(
        'aria-pressed',
        'false'
      );
    });

    test('flags `canCompare` from `minItems` and `canAddItems` from `maxItems`', async () => {
      await render();

      await click('Compare-add-A');

      expect(byTestId('Compare-canCompare')).toHaveTextContent('false');
      expect(byTestId('Compare-canAddItems')).toHaveTextContent('true');

      await click('Compare-add-B');

      expect(byTestId('Compare-canCompare')).toHaveTextContent('true');
      expect(byTestId('Compare-canAddItems')).toHaveTextContent('true');

      await click('Compare-add-C');

      expect(byTestId('Compare-canCompare')).toHaveTextContent('true');
      expect(byTestId('Compare-canAddItems')).toHaveTextContent('false');
    });

    test('ignores items added beyond `maxItems` until one is removed', async () => {
      await render();

      await click('Compare-add-A');
      await click('Compare-add-B');
      await click('Compare-add-C');
      await click('Compare-add-D');
      await click('Compare-toggle-D');

      expect(getItemIds()).toEqual(['A', 'B', 'C']);

      await click('Compare-remove-A');
      await click('Compare-add-D');

      expect(getItemIds()).toEqual(['B', 'C', 'D']);
    });

    test('`compare` hands the selection to the chat, then clears it', async () => {
      const fetchMock = mockAgentFetch();
      await render();

      await click('Compare-add-A');
      await click('Compare-add-B');
      await click('Compare-compare');

      expect(byTestId('Compare-result')).toHaveTextContent('true');
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [, init] = fetchMock.mock.calls[0] as unknown as [
        string,
        RequestInit,
      ];
      const body = JSON.parse(init.body as string);
      expect(body.messages[body.messages.length - 1].parts).toEqual([
        expect.objectContaining({
          type: 'text',
          text: `__ALGOLIA_COMPARISON_${CONFIGURATION_ID}__`,
        }),
      ]);
      expect(getItemIds()).toEqual([]);
      expect(byTestId('Compare-canCompare')).toHaveTextContent('false');
    });

    test('`compare` returns false below `minItems`', async () => {
      const fetchMock = mockAgentFetch();
      await render();

      await click('Compare-add-A');
      await click('Compare-compare');

      expect(byTestId('Compare-result')).toHaveTextContent('false');
      expect(fetchMock).not.toHaveBeenCalled();
      expect(getItemIds()).toEqual(['A']);
    });

    test('`compare` returns false without a `chat` on the index', async () => {
      const fetchMock = mockAgentFetch();
      await render({ renderChat: false });

      await click('Compare-add-A');
      await click('Compare-add-B');
      await click('Compare-compare');

      expect(byTestId('Compare-result')).toHaveTextContent('false');
      expect(fetchMock).not.toHaveBeenCalled();
      expect(getItemIds()).toEqual(['A', 'B']);
    });
  });
}
