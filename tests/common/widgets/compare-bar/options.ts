import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import userEvent from '@testing-library/user-event';

import type { CompareBarWidgetSetup, ReactCompareBarWidgetParams } from '.';
import type { SetupOptions, TestOptions } from '../../common';

const CONFIGURATION_ID = 'algolia_comparison_abc';

const PRODUCTS = [
  { objectID: 'A', name: 'MacBook Pro 14' },
  { objectID: 'B', name: 'MacBook Pro 16' },
  { objectID: 'C', name: 'MacBook Air' },
  { objectID: 'D', title: 'ThinkPad X1' },
  { objectID: 'E' },
];

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

function getBar() {
  return document.querySelector('.ais-CompareBar');
}

function getToggle(objectID: string) {
  return document.querySelector<HTMLButtonElement>(
    `[data-testid="CompareToggle-${objectID}"]`
  )!;
}

function getButton(name: string) {
  return Array.from(
    document.querySelectorAll<HTMLButtonElement>('.ais-CompareBar button')
  ).find(
    (button) =>
      button.textContent?.trim() === name ||
      button.getAttribute('aria-label') === name
  )!;
}

function getItemLabels() {
  return Array.from(document.querySelectorAll('.ais-CompareBar-itemLabel')).map(
    (label) => label.textContent
  );
}

export function createOptionsTests(
  setup: CompareBarWidgetSetup,
  { act }: Required<TestOptions>
) {
  async function renderFlavored(
    widgetParams: SetupOptions<CompareBarWidgetSetup>['widgetParams']
  ) {
    await setup({
      instantSearchOptions: {
        indexName: 'indexName',
        searchClient: createSearchClient({}),
      },
      widgetParams,
    });

    await act(async () => {
      await wait(0);
    });
  }

  // The options shared by the three flavors, which name them the same.
  async function render(
    params: Pick<
      ReactCompareBarWidgetParams,
      'minItems' | 'maxItems' | 'transformItems' | 'translations' | 'renderChat'
    > = {}
  ) {
    const widgetParams = {
      configurationId: CONFIGURATION_ID,
      products: PRODUCTS,
      ...params,
    };

    await renderFlavored({
      javascript: widgetParams,
      react: widgetParams,
      vue: widgetParams,
    });
  }

  async function toggle(...objectIDs: string[]) {
    await act(async () => {
      objectIDs.forEach((objectID) => {
        userEvent.click(getToggle(objectID));
      });
      await wait(0);
    });
  }

  async function click(element: Element) {
    await act(async () => {
      userEvent.click(element);
      await wait(0);
    });
  }

  describe('options', () => {
    test('renders nothing while the selection is empty', async () => {
      await render();

      expect(getBar()).toBeNull();
    });

    test('shows the items selected through a sibling toggle', async () => {
      await render();

      await toggle('A');

      expect(getBar()).toBeInTheDocument();
      expect(getBar()).toHaveAttribute('aria-label', 'Compare');
      expect(getItemLabels()).toEqual(['MacBook Pro 14']);
      expect(getToggle('A')).toHaveAttribute('aria-pressed', 'true');
      expect(getToggle('B')).toHaveAttribute('aria-pressed', 'false');

      await toggle('B');

      expect(getItemLabels()).toEqual(['MacBook Pro 14', 'MacBook Pro 16']);
      expect(document.querySelector('.ais-CompareBar-count')).toHaveTextContent(
        '2 of 3'
      );
      expect(getButton('Compare 2')).toBeEnabled();
    });

    test('removes an item when its toggle is switched off', async () => {
      await render();

      await toggle('A', 'B');
      await toggle('A');

      expect(getItemLabels()).toEqual(['MacBook Pro 16']);
      expect(getToggle('A')).toHaveAttribute('aria-pressed', 'false');

      await toggle('B');

      expect(getBar()).toBeNull();
    });

    test('labels items with `name`, then `title`, then `objectID`', async () => {
      await render();

      await toggle('A', 'D', 'E');

      expect(getItemLabels()).toEqual(['MacBook Pro 14', 'ThinkPad X1', 'E']);
    });

    test('removes an item with its remove button', async () => {
      await render();

      await toggle('A', 'B');

      const removeButton = getButton('Remove MacBook Pro 14 from comparison');
      expect(removeButton).toBeInTheDocument();
      expect(
        getButton('Remove MacBook Pro 16 from comparison')
      ).toBeInTheDocument();

      await click(removeButton);

      expect(getItemLabels()).toEqual(['MacBook Pro 16']);
      expect(getToggle('A')).toHaveAttribute('aria-pressed', 'false');
      expect(getToggle('B')).toHaveAttribute('aria-pressed', 'true');
    });

    test('clears the whole selection', async () => {
      await render();

      await toggle('A', 'B', 'C');

      await click(getButton('Clear all'));

      expect(getBar()).toBeNull();
      expect(getToggle('A')).toHaveAttribute('aria-pressed', 'false');
      expect(getToggle('B')).toHaveAttribute('aria-pressed', 'false');
      expect(getToggle('C')).toHaveAttribute('aria-pressed', 'false');
    });

    test('disables the compare button below `minItems` and shows a hint', async () => {
      await render();

      await toggle('A');

      expect(getButton('Compare 1')).toBeDisabled();
      expect(document.querySelector('.ais-CompareBar-hint')).toHaveTextContent(
        'Select at least 2 products to compare.'
      );

      await toggle('B');

      expect(getButton('Compare 2')).toBeEnabled();
      expect(document.querySelector('.ais-CompareBar-hint')).toBeNull();
    });

    test('honors a custom `minItems`', async () => {
      await render({ minItems: 3 });

      await toggle('A', 'B');

      expect(getButton('Compare 2')).toBeDisabled();
      expect(document.querySelector('.ais-CompareBar-hint')).toHaveTextContent(
        'Select at least 3 products to compare.'
      );

      await toggle('C');

      expect(getButton('Compare 3')).toBeEnabled();
    });

    test('shows the limit hint at `maxItems` and ignores further items', async () => {
      await render();

      await toggle('A', 'B');
      expect(document.querySelector('.ais-CompareBar-hint')).toBeNull();

      await toggle('C');

      expect(document.querySelector('.ais-CompareBar-count')).toHaveTextContent(
        '3 of 3'
      );
      expect(document.querySelector('.ais-CompareBar-hint')).toHaveTextContent(
        'Compare limit reached — remove a product to add another.'
      );

      await toggle('D');

      expect(getItemLabels()).toEqual([
        'MacBook Pro 14',
        'MacBook Pro 16',
        'MacBook Air',
      ]);
      expect(getToggle('D')).toHaveAttribute('aria-pressed', 'false');

      await click(getButton('Remove MacBook Air from comparison'));
      await toggle('D');

      expect(getItemLabels()).toEqual([
        'MacBook Pro 14',
        'MacBook Pro 16',
        'ThinkPad X1',
      ]);
    });

    test('honors a custom `maxItems`', async () => {
      await render({ maxItems: 2 });

      await toggle('A', 'B');

      expect(document.querySelector('.ais-CompareBar-count')).toHaveTextContent(
        '2 of 2'
      );
      expect(document.querySelector('.ais-CompareBar-hint')).toHaveTextContent(
        'Compare limit reached'
      );
    });

    test('applies custom translations', async () => {
      await render({
        translations: {
          title: 'Side by side',
          countText: (count: number, maxItems: number) =>
            `${count}/${maxItems} chosen`,
          compareButtonText: (count: number) => `Go (${count})`,
          clearButtonText: 'Reset',
          removeItemLabel: (label: string) => `Drop ${label}`,
        },
      });

      await toggle('A');

      expect(getBar()).toHaveAttribute('aria-label', 'Side by side');
      expect(document.querySelector('.ais-CompareBar-title')).toHaveTextContent(
        'Side by side'
      );
      expect(document.querySelector('.ais-CompareBar-count')).toHaveTextContent(
        '1/3 chosen'
      );
      expect(getButton('Go (1)')).toBeInTheDocument();
      expect(getButton('Reset')).toBeInTheDocument();
      expect(getButton('Drop MacBook Pro 14')).toBeInTheDocument();
    });

    test('applies custom class names', async () => {
      const shared = { configurationId: CONFIGURATION_ID, products: PRODUCTS };

      await renderFlavored({
        javascript: {
          ...shared,
          cssClasses: {
            root: 'ROOT',
            item: 'ITEM',
            compareButton: 'COMPARE',
          },
        },
        react: {
          ...shared,
          classNames: {
            root: 'ROOT',
            item: 'ITEM',
            compareButton: 'COMPARE',
          },
        },
        vue: {
          ...shared,
          classNames: {
            'ais-CompareBar': 'ROOT',
            'ais-CompareBar-item': 'ITEM',
            'ais-CompareBar-compareButton': 'COMPARE',
          },
        },
      });

      await toggle('A');

      expect(getBar()).toHaveClass('ais-CompareBar', 'ROOT');
      expect(document.querySelector('.ais-CompareBar-item')).toHaveClass(
        'ITEM'
      );
      expect(
        document.querySelector('.ais-CompareBar-compareButton')
      ).toHaveClass('COMPARE');
    });

    test('shows and sends the items returned by `transformItems`', async () => {
      const fetchMock = mockAgentFetch();
      await render({
        transformItems: (items) =>
          items.map((item) => ({
            ...item,
            name: `Refurbished ${item.name}`,
          })),
      });

      await toggle('A', 'B');

      expect(getItemLabels()).toEqual([
        'Refurbished MacBook Pro 14',
        'Refurbished MacBook Pro 16',
      ]);
      // The selection still works on the raw items.
      expect(getToggle('A')).toHaveAttribute('aria-pressed', 'true');

      await click(getButton('Compare 2'));

      const [, init] = fetchMock.mock.calls[0] as unknown as [
        string,
        RequestInit,
      ];
      const body = JSON.parse(init.body as string);
      expect(
        body.messages[body.messages.length - 1].metadata.turnContext
          .selected_products
      ).toBe(
        JSON.stringify([
          { objectID: 'A', name: 'Refurbished MacBook Pro 14' },
          { objectID: 'B', name: 'Refurbished MacBook Pro 16' },
        ])
      );
    });

    test('opens the chat with the comparison, then clears the selection', async () => {
      const fetchMock = mockAgentFetch();
      await render();

      await toggle('A', 'B');
      expect(fetchMock).not.toHaveBeenCalled();
      expect(document.querySelector('.ais-Chat-container')).not.toHaveClass(
        'ais-Chat-container--open'
      );

      await click(getButton('Compare 2'));
      await act(async () => {
        await wait(0);
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [, init] = fetchMock.mock.calls[0] as unknown as [
        string,
        RequestInit,
      ];
      expect(init.headers).toEqual(
        expect.objectContaining({ 'x-algolia-referer': 'compare' })
      );

      const body = JSON.parse(init.body as string);
      const message = body.messages[body.messages.length - 1];
      expect(message.parts).toEqual([
        expect.objectContaining({
          type: 'text',
          text: `__ALGOLIA_COMPARISON_${CONFIGURATION_ID}__`,
        }),
      ]);
      expect(message.metadata.turnContext).toEqual({
        selected_products: JSON.stringify([
          { objectID: 'A', name: 'MacBook Pro 14' },
          { objectID: 'B', name: 'MacBook Pro 16' },
        ]),
        comparison_configuration_id: CONFIGURATION_ID,
      });

      expect(document.querySelector('.ais-Chat-container')).toHaveClass(
        'ais-Chat-container--open'
      );
      expect(document.querySelector('.ais-ChatMessages')).toHaveTextContent(
        'Here is the comparison.'
      );
      // The placeholder is not shown as a user message.
      expect(document.querySelector('.ais-ChatMessages')).not.toHaveTextContent(
        '__ALGOLIA_COMPARISON_'
      );

      expect(getBar()).toBeNull();
      expect(getToggle('A')).toHaveAttribute('aria-pressed', 'false');
      expect(getToggle('B')).toHaveAttribute('aria-pressed', 'false');
    });

    test('does not send anything when the compare button is disabled', async () => {
      const fetchMock = mockAgentFetch();
      await render();

      await toggle('A');
      await click(getButton('Compare 1'));

      expect(fetchMock).not.toHaveBeenCalled();
    });

    test('does nothing without a `chat` on the index', async () => {
      const fetchMock = mockAgentFetch();
      await render({ renderChat: false });

      await toggle('A', 'B');
      await click(getButton('Compare 2'));

      expect(fetchMock).not.toHaveBeenCalled();
      expect(getItemLabels()).toEqual(['MacBook Pro 14', 'MacBook Pro 16']);
    });
  });
}
