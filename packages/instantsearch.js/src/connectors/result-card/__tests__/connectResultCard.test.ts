/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';
import algoliasearchHelper from 'algoliasearch-helper';

import { createSingleSearchResponse } from '../../../../../../tests/mocks/createAPIResponse';
import { createInstantSearch } from '../../../../test/createInstantSearch';
import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from '../../../../test/createWidget';
import { warning } from '../../../lib/utils';
import connectResultCard, {
  getResultCardRuleContext,
} from '../connectResultCard';

import type { ResultCardConnectorParams } from '../connectResultCard';
import type { SearchResults } from 'algoliasearch-helper';

// Matches the connector's DEBOUNCE_MS, plus a buffer.
const DEBOUNCE_WAIT = 720;

const SSE_HEADERS = { 'Content-Type': 'text/event-stream' };

function sseResponse(chunks: Array<Record<string, unknown>>): Response {
  const body = chunks
    .map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`)
    .join('');
  return new Response(`${body}data: [DONE]`, { headers: SSE_HEADERS });
}

function answerResponse(text = 'Here is the answer.'): Response {
  return sseResponse([
    { type: 'start', messageId: 'assistant-1' },
    { type: 'text-start', id: 't1' },
    { type: 'text-delta', id: 't1', delta: text },
    { type: 'text-end', id: 't1' },
    { type: 'finish' },
  ]);
}

function makeResults(
  overrides: {
    hits?: Array<Record<string, unknown>>;
    query?: string;
    enabled?: boolean;
    page?: number;
    index?: string;
    facets?: Record<string, string[]>;
  } = {}
): SearchResults {
  const {
    hits = [{ objectID: '1' }, { objectID: '2' }],
    query = 'running shoes',
    enabled = true,
    page = 0,
    index = 'indexName',
    facets,
  } = overrides;
  const helper = algoliasearchHelper(createSearchClient(), index, {
    disjunctiveFacets: facets ? Object.keys(facets) : [],
    disjunctiveFacetsRefinements: facets,
  });
  const response = createSingleSearchResponse({
    hits: hits as unknown as SearchResults['hits'],
    query,
    page,
    index,
    queryID: 'queryID',
    ...(enabled
      ? { renderingContent: { widgets: { resultCard: { enabled: true } } } }
      : {}),
    // The search client's response type does not know `resultCard` yet.
  } as Parameters<typeof createSingleSearchResponse>[0]);
  return new algoliasearchHelper.SearchResults(helper.state, [response]);
}

function lastRender(renderFn: jest.Mock) {
  return renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
}

describe('connectResultCard', () => {
  const originalFetch = global.fetch;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    warning.cache = {};
    fetchMock = jest.fn(() => Promise.resolve(answerResponse()));
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  function setup(params: Partial<ResultCardConnectorParams> = {}) {
    const renderFn = jest.fn();
    const unmountFn = jest.fn();
    const widget = connectResultCard(
      renderFn,
      unmountFn
    )({ agentId: 'my-agent', ...params } as ResultCardConnectorParams);
    const instantSearchInstance = createInstantSearch();
    const helper = instantSearchInstance.helper!;
    const initOptions = createInitOptions({ instantSearchInstance, helper });
    widget.init!(initOptions);

    const render = (results: SearchResults) => {
      widget.render!(
        createRenderOptions({ instantSearchInstance, helper, results })
      );
    };
    const renderAndWait = async (results: SearchResults) => {
      render(results);
      await wait(DEBOUNCE_WAIT);
      await wait(0);
    };
    const getRequestBody = (call = 0) =>
      JSON.parse(fetchMock.mock.calls[call][1].body as string);
    // For tests that leave a debounced request pending: the timer would
    // otherwise fire into the next test's fetch mock.
    const disposeWidget = () => {
      widget.dispose!(createDisposeOptions({ helper, state: helper.state }));
    };

    return {
      disposeWidget,
      widget,
      renderFn,
      unmountFn,
      instantSearchInstance,
      helper,
      initOptions,
      render,
      renderAndWait,
      getRequestBody,
    };
  }

  describe('Usage', () => {
    it('throws without a render function', () => {
      expect(() => {
        // @ts-expect-error
        connectResultCard()({ agentId: 'a' });
      }).toThrowError(/render function is not valid/);
    });

    it('throws without agentId', () => {
      expect(() =>
        connectResultCard(jest.fn())({} as ResultCardConnectorParams)
      ).toThrowError(/`agentId` option is required/);
    });

    it('sends the request through a custom transport', async () => {
      const customFetch = jest.fn(() => Promise.resolve(answerResponse()));
      const { renderFn, renderAndWait } = setup({
        transport: { api: 'https://custom.api', fetch: customFetch },
      });
      await renderAndWait(makeResults());
      await wait(0);

      expect(customFetch).toHaveBeenCalledTimes(1);
      expect((customFetch.mock.calls[0] as unknown[])[0]).toBe(
        'https://custom.api'
      );
      expect(fetchMock).not.toHaveBeenCalled();
      expect(lastRender(renderFn).status).toBe('complete');
    });

    it('throws when both transport and requestOptions are given', () => {
      expect(() =>
        connectResultCard(jest.fn())({
          agentId: 'a',
          transport: { api: 'https://custom.api' },
          requestOptions: { headers: {} },
        } as unknown as ResultCardConnectorParams)
      ).toThrowError(/mutually exclusive/);
    });

    it('is a widget that opens the chat', () => {
      const widget = connectResultCard(jest.fn())({ agentId: 'a' });
      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.resultCard',
          opensChat: true,
          init: expect.any(Function),
          render: expect.any(Function),
          dispose: expect.any(Function),
        })
      );
    });
  });

  describe('rule context', () => {
    it('derives the context from the agentId, replacing unsupported characters', () => {
      expect(getResultCardRuleContext('my-agent_1')).toBe(
        'agent-studio-result-card-my-agent_1'
      );
      expect(getResultCardRuleContext('my agent.v2')).toBe(
        'agent-studio-result-card-my_agent_v2'
      );
    });

    it('appends its context to existing ruleContexts once', () => {
      const widget = connectResultCard(jest.fn())({ agentId: 'my-agent' });
      const helper = algoliasearchHelper(createSearchClient(), '', {
        ruleContexts: ['other'],
      });

      const state = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {},
      });
      expect(state.ruleContexts).toEqual([
        'other',
        'agent-studio-result-card-my-agent',
      ]);
      expect(
        widget.getWidgetSearchParameters!(state, { uiState: {} }).ruleContexts
      ).toEqual(['other', 'agent-studio-result-card-my-agent']);
    });

    it('warns but still appends when 10 contexts are already set', () => {
      const widget = connectResultCard(jest.fn())({ agentId: 'my-agent' });
      const contexts = Array.from({ length: 10 }, (_, i) => `ctx-${i}`);
      const helper = algoliasearchHelper(createSearchClient(), '', {
        ruleContexts: contexts,
      });

      expect(() => {
        const state = widget.getWidgetSearchParameters!(helper.state, {
          uiState: {},
        });
        expect(state.ruleContexts).toHaveLength(11);
      }).toWarnDev(
        '[InstantSearch.js]: The search already carries 10 `ruleContexts`. The Result Card context "agent-studio-result-card-my-agent" was appended anyway, but Algolia only applies the first 10.'
      );
    });

    it('removes only its own context on dispose', () => {
      const { widget, unmountFn } = setup();
      const helper = algoliasearchHelper(createSearchClient(), '', {
        ruleContexts: ['other', 'agent-studio-result-card-my-agent'],
      });

      const state = widget.dispose!(
        createDisposeOptions({ helper, state: helper.state })
      ) as ReturnType<typeof helper.state.setQueryParameter>;

      expect(state.ruleContexts).toEqual(['other']);
      expect(unmountFn).toHaveBeenCalledTimes(1);
    });

    it('unsets ruleContexts on dispose when it was the only one', () => {
      const { widget } = setup();
      const helper = algoliasearchHelper(createSearchClient(), '', {
        ruleContexts: ['agent-studio-result-card-my-agent'],
      });

      const state = widget.dispose!(
        createDisposeOptions({ helper, state: helper.state })
      ) as ReturnType<typeof helper.state.setQueryParameter>;

      expect(state.ruleContexts).toBeUndefined();
    });
  });

  describe('activation', () => {
    it('renders hidden on init', () => {
      const { renderFn } = setup();
      expect(renderFn).toHaveBeenCalledTimes(1);
      expect(lastRender(renderFn)).toEqual(
        expect.objectContaining({ status: 'hidden', query: '', messages: [] })
      );
      expect(renderFn.mock.calls[0][1]).toBe(true);
    });

    it('stays hidden when the Rule did not enable the card', async () => {
      const { renderFn, renderAndWait } = setup();
      await renderAndWait(makeResults({ enabled: false }));

      expect(lastRender(renderFn).status).toBe('hidden');
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('stays hidden when the query has fewer than two words', async () => {
      const { renderFn, renderAndWait } = setup();
      await renderAndWait(makeResults({ query: ' shoes ' }));

      expect(lastRender(renderFn).status).toBe('hidden');
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('loads immediately and requests after the debounce', async () => {
      const { renderFn, render } = setup();
      render(makeResults());

      expect(lastRender(renderFn)).toEqual(
        expect.objectContaining({ status: 'loading', query: 'running shoes' })
      );
      expect(fetchMock).not.toHaveBeenCalled();

      await wait(DEBOUNCE_WAIT);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('activates with zero hits', async () => {
      const { renderAndWait, getRequestBody } = setup();
      await renderAndWait(makeResults({ hits: [] }));

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(getRequestBody().messages[0].metadata.turnContext.hitsSample).toBe(
        '[]'
      );
    });

    it('sends the query as a question with the turn context and referer', async () => {
      const { renderAndWait, getRequestBody } = setup();
      await renderAndWait(
        makeResults({
          hits: [
            { objectID: '1', name: 'Pegasus', _highlightResult: {} },
            { objectID: '2', name: 'Vomero', __position: 2 },
            { objectID: '3' },
            { objectID: '4' },
            { objectID: '5' },
            { objectID: '6' },
          ],
          facets: { brand: ['Nike'] },
        })
      );

      const [, init] = fetchMock.mock.calls[0];
      expect(init.headers).toEqual(
        expect.objectContaining({ 'x-algolia-referer': 'result-card' })
      );

      const { messages } = getRequestBody();
      expect(messages).toHaveLength(1);
      expect(messages[0].role).toBe('user');
      expect(messages[0].parts).toEqual([
        {
          type: 'text',
          text: 'I\'m looking for "running shoes". Which of these results would you recommend and why? Prefer the results provided; if they don\'t answer the question, search for better ones. Always answer in two or three sentences and never display results.',
        },
      ]);

      const { turnContext } = messages[0].metadata;
      expect(turnContext.query).toBe('running shoes');
      expect(JSON.parse(turnContext.filters)).toEqual([['brand:Nike']]);
      expect(JSON.parse(turnContext.hitsSample)).toEqual([
        { objectID: '1', name: 'Pegasus' },
        { objectID: '2', name: 'Vomero' },
        { objectID: '3' },
        { objectID: '4' },
        { objectID: '5' },
      ]);
    });

    it('streams the answer and completes', async () => {
      const { renderFn, renderAndWait } = setup();
      await renderAndWait(makeResults());
      await wait(0);

      const renderState = lastRender(renderFn);
      expect(renderState.status).toBe('complete');
      expect(renderState.messages).toHaveLength(2);
      expect(renderState.messages[1]).toEqual(
        expect.objectContaining({
          role: 'assistant',
          parts: [
            expect.objectContaining({
              type: 'text',
              text: 'Here is the answer.',
            }),
          ],
        })
      );
      expect(renderState.error).toBeUndefined();
    });

    it('keeps the output of the server-executed built-in tools', async () => {
      fetchMock.mockImplementationOnce(() =>
        Promise.resolve(
          sseResponse([
            { type: 'start', messageId: 'assistant-1' },
            { type: 'start-step' },
            {
              type: 'tool-input-available',
              toolCallId: 'call-1',
              toolName: 'algolia_search_index_indexName',
              input: { queries: [{ query: 'running shoes' }] },
            },
            {
              type: 'tool-output-available',
              toolCallId: 'call-1',
              output: { hits: [{ objectID: '1', name: 'Pegasus' }] },
            },
            {
              type: 'tool-input-available',
              toolCallId: 'call-2',
              toolName: 'algolia_ponder',
              input: { thought: 'Compare cushioning.' },
            },
            {
              type: 'tool-output-available',
              toolCallId: 'call-2',
              output: { ok: true },
            },
            {
              type: 'tool-input-available',
              toolCallId: 'call-3',
              toolName: 'algolia_grouped_results',
              input: { groups: [{ title: 'Trail' }] },
            },
            {
              type: 'tool-output-available',
              toolCallId: 'call-3',
              output: { groups: [{ title: 'Trail', hits: [] }] },
            },
            { type: 'finish-step' },
            { type: 'finish' },
          ])
        )
      );
      const { renderFn, renderAndWait } = setup();
      await renderAndWait(makeResults());
      await wait(0);

      const { messages } = lastRender(renderFn);
      expect(messages[1].parts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'tool-algolia_search_index_indexName',
            state: 'output-available',
            output: { hits: [{ objectID: '1', name: 'Pegasus' }] },
          }),
          expect.objectContaining({
            type: 'tool-algolia_ponder',
            state: 'output-available',
            output: { ok: true },
          }),
          expect.objectContaining({
            type: 'tool-algolia_grouped_results',
            state: 'output-available',
            output: { groups: [{ title: 'Trail', hits: [] }] },
          }),
        ])
      );
    });

    it('sends a view event for the sampled hits', async () => {
      const { renderAndWait, instantSearchInstance } = setup();
      await renderAndWait(makeResults());

      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'view',
          widgetType: 'ais.resultCard',
          payload: expect.objectContaining({
            objectIDs: ['1', '2'],
            index: 'indexName',
          }),
        })
      );
    });

    it('describes the sampled page in the view event after paginating', async () => {
      const { render, instantSearchInstance } = setup();
      render(makeResults());
      // Same question, next page: the first-page sample is kept.
      render(
        makeResults({ page: 1, hits: [{ objectID: '9' }, { objectID: '10' }] })
      );
      await wait(DEBOUNCE_WAIT);
      await wait(0);

      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'view',
          hits: [
            expect.objectContaining({ objectID: '1', __position: 1 }),
            expect.objectContaining({ objectID: '2', __position: 2 }),
          ],
        })
      );
    });
  });

  describe('signature', () => {
    it('does not request again for identical results', async () => {
      const { renderAndWait } = setup();
      await renderAndWait(makeResults());
      await renderAndWait(makeResults());

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('keeps the answer across pagination', async () => {
      const { renderFn, renderAndWait } = setup();
      await renderAndWait(makeResults());
      await renderAndWait(
        makeResults({ page: 1, hits: [{ objectID: '9' }, { objectID: '10' }] })
      );

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(lastRender(renderFn).status).toBe('complete');
    });

    it('requests again when the query changes', async () => {
      const { renderAndWait, getRequestBody } = setup();
      await renderAndWait(makeResults());
      await renderAndWait(makeResults({ query: 'trail shoes' }));

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(getRequestBody(1).messages[0].parts[0].text).toContain(
        '"trail shoes"'
      );
    });

    it('requests again when the filters change', async () => {
      const { renderAndWait } = setup();
      await renderAndWait(makeResults());
      await renderAndWait(makeResults({ facets: { brand: ['Nike'] } }));

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('hides the previous answer while the new request is pending', async () => {
      const { renderFn, render, renderAndWait, disposeWidget } = setup();
      await renderAndWait(makeResults());
      expect(lastRender(renderFn).status).toBe('complete');

      render(makeResults({ query: 'trail shoes' }));

      const renderState = lastRender(renderFn);
      expect(renderState.status).toBe('loading');
      expect(renderState.query).toBe('trail shoes');
      expect(renderState.messages).toEqual([]);
      expect(renderState.suggestions).toBeUndefined();
      disposeWidget();
    });

    it('hides the previous error while the new request is pending', async () => {
      fetchMock.mockImplementationOnce(() =>
        Promise.reject(new Error('network down'))
      );
      const { renderFn, render, renderAndWait, disposeWidget } = setup();
      await renderAndWait(makeResults());
      expect(lastRender(renderFn).status).toBe('failed');

      render(makeResults({ query: 'trail shoes' }));

      expect(lastRender(renderFn).status).toBe('loading');
      expect(lastRender(renderFn).error).toBeUndefined();
      disposeWidget();
    });

    it('requests again when the top hits change on the first page', async () => {
      const { renderAndWait } = setup();
      await renderAndWait(makeResults());
      await renderAndWait(makeResults({ hits: [{ objectID: '3' }] }));

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('only fires the last request of a burst of changes', async () => {
      const { render } = setup();
      render(makeResults({ query: 'running shoes' }));
      await wait(300);
      render(makeResults({ query: 'running shoes red' }));
      await wait(DEBOUNCE_WAIT);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
      expect(body.messages[0].parts[0].text).toContain('"running shoes red"');
    });

    it('hides again when the Rule stops matching', async () => {
      const { renderFn, renderAndWait } = setup();
      await renderAndWait(makeResults());
      await renderAndWait(makeResults({ enabled: false }));

      expect(lastRender(renderFn).status).toBe('hidden');
    });
  });

  describe('dismiss and retry', () => {
    it('dismisses for the current signature and clears on a new one', async () => {
      const { renderFn, renderAndWait } = setup();
      await renderAndWait(makeResults());

      lastRender(renderFn).dismiss();
      expect(lastRender(renderFn).status).toBe('dismissed');

      await renderAndWait(makeResults());
      expect(lastRender(renderFn).status).toBe('dismissed');

      await renderAndWait(makeResults({ query: 'trail shoes' }));
      expect(lastRender(renderFn).status).toBe('complete');
    });

    it('cancels a pending request when dismissed', async () => {
      const { renderFn, render } = setup();
      render(makeResults());
      lastRender(renderFn).dismiss();
      await wait(DEBOUNCE_WAIT);

      expect(fetchMock).not.toHaveBeenCalled();
      expect(lastRender(renderFn).status).toBe('dismissed');
    });

    it('fails on a request error and retries on demand', async () => {
      fetchMock.mockImplementationOnce(() =>
        Promise.reject(new Error('network down'))
      );
      const { renderFn, renderAndWait } = setup();
      await renderAndWait(makeResults());

      expect(lastRender(renderFn).status).toBe('failed');
      expect(lastRender(renderFn).error).toEqual(
        expect.objectContaining({ message: 'network down' })
      );

      lastRender(renderFn).retry();
      expect(lastRender(renderFn).status).toBe('loading');
      await wait(0);
      await wait(0);

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(lastRender(renderFn).status).toBe('complete');
      expect(lastRender(renderFn).error).toBeUndefined();
    });

    it('toggles expanded and resets it on a new signature', async () => {
      const { renderFn, renderAndWait } = setup();
      await renderAndWait(makeResults());

      expect(lastRender(renderFn).expanded).toBe(false);
      lastRender(renderFn).setExpanded(true);
      expect(lastRender(renderFn).expanded).toBe(true);

      await renderAndWait(makeResults({ query: 'trail shoes' }));
      expect(lastRender(renderFn).expanded).toBe(false);
    });
  });

  describe('chat handoff', () => {
    function mountDefaultChat(
      instantSearchInstance: ReturnType<typeof createInstantSearch>,
      agentId = 'my-agent'
    ) {
      const chat = {
        adoptConversation: jest.fn(() => true),
        setOpen: jest.fn(),
        sendMessage: jest.fn(),
        status: 'ready',
        widgetParams: { agentId },
      };
      const indexId = instantSearchInstance.mainIndex.getIndexId();
      instantSearchInstance.renderState[indexId] = {
        ...instantSearchInstance.renderState[indexId],
        chat: chat as never,
      };
      return chat;
    }

    it('cannot continue in chat without a chat widget', async () => {
      const { renderFn, renderAndWait } = setup();
      await expect(async () => {
        await renderAndWait(makeResults());
      }).toWarnDev(
        '[InstantSearch.js]: No `chat` widget with the agent "my-agent" is mounted on this index, so the Result Card cannot hand its conversation off and hides "Continue in chat".'
      );

      expect(lastRender(renderFn).canContinueInChat).toBe(false);
    });

    it('cannot continue in chat when the chat uses another agent', async () => {
      const { renderFn, renderAndWait, instantSearchInstance } = setup();
      mountDefaultChat(instantSearchInstance, 'other-agent');
      await renderAndWait(makeResults());

      expect(lastRender(renderFn).canContinueInChat).toBe(false);
    });

    it('hands the conversation off and opens the chat', async () => {
      const { renderFn, renderAndWait, instantSearchInstance } = setup();
      const chat = mountDefaultChat(instantSearchInstance);
      await renderAndWait(makeResults());
      await wait(0);

      const renderState = lastRender(renderFn);
      expect(renderState.canContinueInChat).toBe(true);

      renderState.continueInChat();

      expect(chat.adoptConversation).toHaveBeenCalledWith({
        id: expect.any(String),
        messages: renderState.messages,
        source: 'resultCard',
      });
      expect(chat.setOpen).toHaveBeenCalledWith(true);
      expect(chat.sendMessage).not.toHaveBeenCalled();
    });

    it('does not open the chat when it refuses the conversation', async () => {
      const { renderFn, renderAndWait, instantSearchInstance } = setup();
      const chat = mountDefaultChat(instantSearchInstance);
      chat.adoptConversation.mockReturnValue(false);
      await renderAndWait(makeResults());
      await wait(0);

      lastRender(renderFn).continueInChat('Which one is waterproof?');

      expect(chat.adoptConversation).toHaveBeenCalledTimes(1);
      expect(chat.setOpen).not.toHaveBeenCalled();
      expect(chat.sendMessage).not.toHaveBeenCalled();
    });

    it('sends a follow-up suggestion after the handoff', async () => {
      const { renderFn, renderAndWait, instantSearchInstance } = setup();
      const chat = mountDefaultChat(instantSearchInstance);
      await renderAndWait(makeResults());
      await wait(0);

      lastRender(renderFn).continueInChat('Which one is waterproof?');

      expect(chat.adoptConversation).toHaveBeenCalledTimes(1);
      expect(chat.sendMessage).toHaveBeenCalledWith(
        { text: 'Which one is waterproof?' },
        { headers: { 'x-algolia-referer': 'result-card' } }
      );
    });
  });

  describe('getWidgetRenderState before render', () => {
    it('derives the activation from the results without requesting', async () => {
      const widget = connectResultCard(jest.fn())({ agentId: 'my-agent' });
      const renderOptions = createRenderOptions({ results: makeResults() });

      const renderState = widget.getWidgetRenderState(renderOptions);
      expect(renderState).toEqual(
        expect.objectContaining({
          status: 'loading',
          query: 'running shoes',
          widgetParams: { agentId: 'my-agent' },
        })
      );

      await wait(DEBOUNCE_WAIT);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('exposes the render state under `resultCard`', () => {
      const { widget, initOptions } = setup();
      const renderState = widget.getRenderState({}, initOptions);

      expect(renderState.resultCard).toEqual(
        expect.objectContaining({
          status: 'hidden',
          widgetParams: { agentId: 'my-agent' },
        })
      );
    });
  });
});
