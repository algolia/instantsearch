import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import userEvent from '@testing-library/user-event';

import {
  ANSWER,
  DEBOUNCE_MS,
  createResultsClient,
  mockAgentFetch,
} from './utils';

import type { ResultCardWidgetSetup } from '.';
import type { TestOptions } from '../../common';

const AGENT_ID = 'test-agent-id';

export function createOptionsTests(
  setup: ResultCardWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('options', () => {
    test('throws without agentId', () => {
      const searchClient = createSearchClient({});

      expect(() =>
        setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            javascript: {} as any,
            react: {} as any,
            vue: {},
          },
        })
      ).toThrow('The `agentId` option is required.');
    });

    test('sends its rule context with the search', async () => {
      // Not activated: the widget from this test outlives it, and must not
      // fire a debounced request into the next one.
      const searchClient = createResultsClient({ enabled: false });
      mockAgentFetch();

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: { agentId: 'my agent.v2' },
          react: { agentId: 'my agent.v2' },
          vue: {},
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(searchClient.search).toHaveBeenCalledWith([
        expect.objectContaining({
          params: expect.objectContaining({
            ruleContexts: ['agent-studio-result-card-my_agent_v2'],
          }),
        }),
      ]);
    });

    test('stays hidden when no Rule enables the card', async () => {
      const searchClient = createResultsClient({ enabled: false });
      const fetchMock = mockAgentFetch();

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: { agentId: AGENT_ID },
          react: { agentId: AGENT_ID },
          vue: {},
        },
      });

      await act(async () => {
        await wait(DEBOUNCE_MS + 100);
      });

      expect(document.querySelector('.ais-ResultCard')).toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    test('stays hidden for a single-word query', async () => {
      const searchClient = createResultsClient({ query: 'shoes' });
      const fetchMock = mockAgentFetch();

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: { agentId: AGENT_ID },
          react: { agentId: AGENT_ID },
          vue: {},
        },
      });

      await act(async () => {
        await wait(DEBOUNCE_MS + 100);
      });

      expect(document.querySelector('.ais-ResultCard')).toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    test('shows a skeleton, then streams the answer', async () => {
      const searchClient = createResultsClient();
      const fetchMock = mockAgentFetch();

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: { agentId: AGENT_ID },
          react: { agentId: AGENT_ID },
          vue: {},
        },
      });

      await act(async () => {
        await wait(0);
      });

      // Activated but still within the debounce: skeleton, no request yet.
      const root = document.querySelector('.ais-ResultCard');
      expect(root).toHaveAttribute('data-status', 'loading');
      expect(root).toHaveAttribute('aria-busy', 'true');
      expect(root).toHaveAttribute('aria-live', 'polite');
      expect(
        document.querySelector('.ais-ResultCard-loader')
      ).toBeInTheDocument();
      expect(fetchMock).not.toHaveBeenCalled();

      await act(async () => {
        await wait(DEBOUNCE_MS + 100);
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [, init] = fetchMock.mock.calls[0] as unknown as [
        string,
        RequestInit,
      ];
      expect(init.headers).toEqual(
        expect.objectContaining({ 'x-algolia-referer': 'result-card' })
      );
      const body = JSON.parse(init.body as string);
      expect(body.messages[0].metadata.turnContext).toEqual({
        query: 'running shoes',
        hitsSample: JSON.stringify([
          { objectID: '1', name: 'Pegasus' },
          { objectID: '2', name: 'Vomero' },
        ]),
      });

      expect(document.querySelector('.ais-ResultCard')).toHaveAttribute(
        'data-status',
        'complete'
      );
      expect(document.querySelector('.ais-ResultCard')).not.toHaveAttribute(
        'aria-busy'
      );
      expect(document.querySelector('.ais-ResultCard-body')).toHaveTextContent(
        ANSWER
      );
      expect(
        document.querySelector('.ais-ResultCard-body')
      ).not.toHaveTextContent('running shoes');
    });

    test('dismisses the card', async () => {
      const searchClient = createResultsClient();
      mockAgentFetch();

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: { agentId: AGENT_ID },
          react: { agentId: AGENT_ID },
          vue: {},
        },
      });

      await act(async () => {
        await wait(DEBOUNCE_MS + 100);
      });

      await act(async () => {
        await userEvent.click(
          document.querySelector<HTMLButtonElement>(
            '.ais-ResultCard-dismissButton'
          )!
        );
        await wait(0);
      });

      // Fades out first; the dismissal commits when the transition ends.
      const card = document.querySelector('.ais-ResultCard')!;
      expect(card).toHaveClass('ais-ResultCard--leaving');
      await act(async () => {
        // jsdom has no `TransitionEvent`: a plain event with `propertyName`.
        const transitionEnd = new Event('transitionend', { bubbles: true });
        Object.defineProperty(transitionEnd, 'propertyName', {
          value: 'opacity',
        });
        card.dispatchEvent(transitionEnd);
        await wait(0);
      });
      expect(document.querySelector('.ais-ResultCard')).toBeNull();
    });

    test('shows the error and retries on demand', async () => {
      const searchClient = createResultsClient();
      const fetchMock = mockAgentFetch();
      fetchMock.mockImplementationOnce(() =>
        Promise.reject(new Error('network down'))
      );

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: { agentId: AGENT_ID },
          react: { agentId: AGENT_ID },
          vue: {},
        },
      });

      await act(async () => {
        await wait(DEBOUNCE_MS + 100);
      });

      expect(document.querySelector('.ais-ResultCard')).toHaveAttribute(
        'data-status',
        'failed'
      );
      expect(
        document.querySelector('.ais-ChatMessageError')
      ).toBeInTheDocument();

      await act(async () => {
        await userEvent.click(
          document.querySelector<HTMLButtonElement>(
            '.ais-ChatMessageError button'
          )!
        );
        await wait(0);
        await wait(0);
      });

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(document.querySelector('.ais-ResultCard')).toHaveAttribute(
        'data-status',
        'complete'
      );
      expect(document.querySelector('.ais-ResultCard-body')).toHaveTextContent(
        ANSWER
      );
    });

    test('hands the conversation to the chat on the same index', async () => {
      const searchClient = createResultsClient();
      mockAgentFetch();

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: { agentId: AGENT_ID },
          react: { agentId: AGENT_ID },
          vue: {},
        },
      });

      await act(async () => {
        await wait(DEBOUNCE_MS + 100);
      });

      const continueButton = document.querySelector<HTMLButtonElement>(
        '.ais-ResultCard-continueButton'
      );
      expect(continueButton).toBeInTheDocument();
      expect(document.querySelector('.ais-ChatMessages')).not.toHaveTextContent(
        ANSWER
      );

      await act(async () => {
        await userEvent.click(continueButton!);
        await wait(0);
      });

      expect(document.querySelector('.ais-ChatMessages')).toHaveTextContent(
        ANSWER
      );
    });

    test('hides the handoff without a chat using the same agent', async () => {
      const searchClient = createResultsClient();
      mockAgentFetch();

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: { agentId: AGENT_ID, renderChat: false },
          react: { agentId: AGENT_ID, renderChat: false },
          vue: {},
        },
      });

      await act(async () => {
        await wait(DEBOUNCE_MS + 100);
      });

      expect(document.querySelector('.ais-ResultCard')).toHaveAttribute(
        'data-status',
        'complete'
      );
      expect(
        document.querySelector('.ais-ResultCard-continueButton')
      ).toBeNull();
    });

    test('applies translations and class names', async () => {
      const searchClient = createResultsClient();
      mockAgentFetch();

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: {
            agentId: AGENT_ID,
            translations: {
              headerTitle: 'Aperçu',
              continueInChatText: 'Continuer',
            },
            cssClasses: { root: 'ROOT', header: 'HEADER' },
          },
          react: {
            agentId: AGENT_ID,
            translations: {
              headerTitle: 'Aperçu',
              continueInChatText: 'Continuer',
            },
            classNames: { root: 'ROOT', header: 'HEADER' },
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(DEBOUNCE_MS + 100);
      });

      expect(document.querySelector('.ais-ResultCard')).toHaveClass('ROOT');
      expect(document.querySelector('.ais-ResultCard-header')).toHaveClass(
        'HEADER'
      );
      expect(
        document.querySelector('.ais-ResultCard-headerTitle')
      ).toHaveTextContent('Aperçu');
      expect(
        document.querySelector('.ais-ResultCard-continueButton')
      ).toHaveTextContent('Continuer');
    });
  });
}
