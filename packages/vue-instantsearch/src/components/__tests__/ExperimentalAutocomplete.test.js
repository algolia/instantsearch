/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import {
  createCompositionClient,
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { Chat } from 'instantsearch.js/es/lib/chat';

import { createApp, mountApp, nextTick } from '../../../test/utils';
import {
  AisChat,
  AisExperimentalAutocomplete,
  AisInstantSearch,
} from '../../instantsearch';
import { isVue3, renderCompat } from '../../util/vue-compat';

jest.unmock('instantsearch.js/es');

function createMockedSearchClient(response) {
  return createSearchClient({
    search: jest.fn(() => Promise.resolve(response)),
  });
}

function findIsolatedIndex(instantSearchInstance) {
  return instantSearchInstance.mainIndex
    .getWidgets()
    .find((widget) => widget.$$type === 'ais.index' && widget._isolated);
}

async function mountAutocomplete({
  props = {},
  slots = {},
  searchClient = createSearchClient(),
  instantSearchProps = { indexName: 'indexName' },
  chat,
  validateChatEntryPoints = false,
} = {}) {
  const container = document.body.appendChild(document.createElement('div'));
  const instance = {};

  const InstanceSpy = {
    inject: { instantSearchInstance: { from: '$_ais_instantSearchInstance' } },
    created() {
      instance.current = this.instantSearchInstance;
    },
    render() {
      return null;
    },
  };

  const app = createApp({
    render: renderCompat((h) =>
      h(AisInstantSearch, { props: { ...instantSearchProps, searchClient } }, [
        h(InstanceSpy),
        h(AisExperimentalAutocomplete, { props, scopedSlots: slots }),
        chat &&
          h(AisChat, {
            props: {
              agentId: 'agentId',
              requiresSearch: false,
              chat,
              // Only the test about the warning wants it: it's deferred, so it
              // would otherwise leak into the next test.
              disableTriggerValidation: !validateChatEntryPoints,
            },
          }),
      ])
    ),
  });
  if (isVue3) {
    app.mount(container);
  } else {
    app.$mount(container);
  }

  await nextTick();
  await wait(0);

  return {
    searchClient,
    app,
    container,
    instantSearchInstance: instance.current,
  };
}

describe('AisExperimentalAutocomplete', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    // The chat persists its messages and conversation.
    sessionStorage.clear();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
    });
    window.scrollTo = jest.fn();
  });

  test('renders a shell without searching until the input is focused', async () => {
    const { searchClient } = await mountAutocomplete({
      props: { indices: [{ indexName: 'indexName' }], requiresSearch: false },
    });

    expect(document.querySelector('.ais-Autocomplete')).not.toBeNull();
    expect(searchClient.search).not.toHaveBeenCalled();

    document.querySelector('input').dispatchEvent(new Event('focus'));
    await nextTick();
    await wait(0);

    expect(searchClient.search).toHaveBeenCalledTimes(1);
  });

  test('mounts the isolated index subtree on focus', async () => {
    const { instantSearchInstance } = await mountAutocomplete({
      props: {
        indices: [{ indexName: 'indexName' }],
        showQuerySuggestions: { indexName: 'suggestions' },
      },
    });

    expect(findIsolatedIndex(instantSearchInstance)).toBeUndefined();

    document.querySelector('input').dispatchEvent(new Event('focus'));
    await nextTick();
    await wait(0);

    const isolatedIndex = findIsolatedIndex(instantSearchInstance);
    expect(isolatedIndex.getIndexId()).toMatch(/^ais-autocomplete-\d+$/);

    const children = isolatedIndex.getWidgets();
    expect(children.map((widget) => widget.$$type)).toEqual([
      'ais.configure',
      'ais.index',
      'ais.index',
      'ais.autocomplete',
    ]);
    expect(
      children
        .filter((widget) => widget.$$type === 'ais.index')
        .map((widget) => widget.getIndexName())
    ).toEqual(['suggestions', 'indexName']);
  });

  test('keeps a query typed before the isolated index is mounted', async () => {
    const { searchClient } = await mountAutocomplete({
      props: { indices: [{ indexName: 'indexName' }], requiresSearch: false },
    });

    const input = document.querySelector('input');
    input.dispatchEvent(new Event('focus'));
    input.value = 'apple';
    input.dispatchEvent(new Event('input'));
    await nextTick();
    await wait(0);
    expect(searchClient.search).toHaveBeenLastCalledWith([
      expect.objectContaining({
        indexName: 'indexName',
        params: expect.objectContaining({ query: 'apple' }),
      }),
    ]);
  });

  test('registers the feeds in the isolated composition index', async () => {
    const { instantSearchInstance } = await mountAutocomplete({
      props: { feeds: [{ feedID: 'products' }] },
      searchClient: createCompositionClient({}),
      instantSearchProps: { compositionID: 'my-composition' },
    });

    document.querySelector('input').dispatchEvent(new Event('focus'));
    await nextTick();
    await wait(0);

    const isolatedIndex = findIsolatedIndex(instantSearchInstance);
    expect(isolatedIndex.getIndexName()).toBe('my-composition');
    expect(isolatedIndex.getWidgets().map((widget) => widget.$$type)).toEqual([
      'ais.configure',
      'ais.feeds',
      'ais.feedContainer',
      'ais.autocomplete',
    ]);
  });

  test('renders default suggestion markup without slots', async () => {
    await mountAutocomplete({
      props: { showQuerySuggestions: { indexName: 'suggestions' } },
      searchClient: createMockedSearchClient(
        createMultiSearchResponse(
          createSingleSearchResponse({
            index: 'suggestions',
            hits: [{ objectID: '1', query: 'hello' }],
          })
        )
      ),
    });

    document.querySelector('input').dispatchEvent(new Event('focus'));
    await nextTick();
    await wait(0);

    expect(
      document.querySelector('.ais-AutocompleteSuggestions')
    ).not.toBeNull();
  });

  test('passes the index name to the item slot', async () => {
    const item = jest.fn(
      ({ item: hit, indexName }) => `${indexName}:${hit.objectID}`
    );
    await mountAutocomplete({
      props: { indices: [{ indexName: 'indexName' }] },
      slots: { item },
      searchClient: createMockedSearchClient(
        createMultiSearchResponse(
          createSingleSearchResponse({
            index: 'indexName',
            hits: [{ objectID: '1' }],
          })
        )
      ),
    });

    document.querySelector('input').dispatchEvent(new Event('focus'));
    await nextTick();
    await wait(0);

    expect(item).toHaveBeenCalledWith(
      expect.objectContaining({ indexName: 'indexName' })
    );
    expect(
      document.querySelector('.ais-AutocompleteIndexItem').textContent
    ).toBe('indexName:1');
  });

  test('cleans up the isolated tree and body class on unmount', async () => {
    const { app, searchClient } = await mountAutocomplete({
      props: { indices: [{ indexName: 'indexName' }] },
    });

    document.querySelector('input').dispatchEvent(new Event('focus'));
    await nextTick();
    await wait(0);
    expect(searchClient.search).toHaveBeenCalled();

    if (isVue3) {
      app.unmount();
    } else {
      app.$destroy();
    }
    await nextTick();

    expect(document.body.classList.contains('ais-Autocomplete--detached')).toBe(
      false
    );
  });

  test('reports an error when feeds and indices are both provided', () => {
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});

    try {
      mountApp(
        {
          render: renderCompat((h) =>
            h(
              AisInstantSearch,
              {
                props: {
                  indexName: 'indexName',
                  searchClient: createSearchClient(),
                },
              },
              [
                h(AisExperimentalAutocomplete, {
                  props: { indices: [], feeds: [] },
                }),
              ]
            )
          ),
        },
        document.body.appendChild(document.createElement('div'))
      );
    } catch (error) {
      // Vue 3 rethrows errors of lifecycle hooks in development
      errors(error);
    }

    expect(
      errors.mock.calls.some((call) =>
        call.some((arg) => String(arg).includes('mutually exclusive'))
      )
    ).toBe(true);
    errors.mockRestore();
  });

  describe('with <ais-chat> in the same index', () => {
    const promptSuggestionsClient = () =>
      createMockedSearchClient(
        createMultiSearchResponse(
          createSingleSearchResponse({
            index: 'prompts',
            hits: [{ objectID: '1', prompt: 'What is the best product?' }],
          })
        )
      );

    async function focusInput() {
      document.querySelector('input').dispatchEvent(new Event('focus'));
      await nextTick();
      await wait(0);
      await nextTick();
    }

    test('sends the selected prompt suggestion to the chat', async () => {
      const chat = new Chat({});
      const sendMessage = jest
        .spyOn(chat, 'sendMessage')
        .mockImplementation(() => Promise.resolve());

      await mountAutocomplete({
        props: { showPromptSuggestions: { indexName: 'prompts' } },
        searchClient: promptSuggestionsClient(),
        chat,
      });
      await focusInput();

      const input = document.querySelector('input');
      input.value = 'best';
      input.dispatchEvent(new Event('input'));
      await nextTick();

      document
        .querySelector('.ais-AutocompletePromptSuggestionWrapper')
        .click();
      await nextTick();
      await wait(0);
      await nextTick();

      expect(sendMessage).toHaveBeenCalledTimes(1);
      expect(sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'What is the best product?' }),
        { headers: { 'x-algolia-referer': 'prompt-suggestions-autocomplete' } }
      );
      expect(document.querySelector('input').value).toBe('');
    });

    test('opens the chat from the AI mode button', async () => {
      const chat = new Chat({});
      const sendMessage = jest
        .spyOn(chat, 'sendMessage')
        .mockImplementation(() => Promise.resolve());

      await mountAutocomplete({
        props: { aiMode: true, indices: [{ indexName: 'indexName' }] },
        chat,
      });
      await focusInput();

      expect(document.querySelector('.ais-Chat-container--open')).toBeNull();

      const input = document.querySelector('input');
      input.value = 'hello';
      input.dispatchEvent(new Event('input'));
      await nextTick();

      document.querySelector('.ais-AiModeButton').click();
      await nextTick();
      await wait(0);
      await nextTick();

      expect(
        document.querySelector('.ais-Chat-container--open')
      ).not.toBeNull();
      expect(sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'hello' }),
        { headers: { 'x-algolia-referer': 'ai-mode' } }
      );
    });

    test.each(['submitted', 'streaming'])(
      'disables the AI mode button while the chat is %s',
      async (status) => {
        const chat = new Chat({});

        await mountAutocomplete({
          props: { aiMode: true, indices: [{ indexName: 'indexName' }] },
          chat,
        });
        await focusInput();

        const button = () => document.querySelector('.ais-AiModeButton');
        expect(button().disabled).toBe(false);

        chat.state.status = status;
        await nextTick();
        await wait(0);
        await nextTick();
        expect(button().disabled).toBe(true);

        chat.state.status = 'ready';
        await nextTick();
        await wait(0);
        await nextTick();
        expect(button().disabled).toBe(false);
      }
    );

    test('does not warn that the chat has no way to be opened with `aiMode`', async () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

      await mountAutocomplete({
        props: { aiMode: true, indices: [{ indexName: 'indexName' }] },
        chat: new Chat({}),
        validateChatEntryPoints: true,
      });
      // The entry point check is deferred and runs before the first focus.
      await wait(0);

      expect(warn).not.toHaveBeenCalledWith(
        expect.stringContaining('has no way to be opened')
      );
      warn.mockRestore();
    });

    test('warns that `<ais-chat>` is missing for prompt suggestions', async () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

      await mountAutocomplete({
        props: { showPromptSuggestions: { indexName: 'prompts' } },
        searchClient: promptSuggestionsClient(),
      });
      await focusInput();

      document
        .querySelector('.ais-AutocompletePromptSuggestionWrapper')
        .click();
      await nextTick();

      expect(warn).toHaveBeenCalledWith(expect.stringContaining('<ais-chat>'));
      warn.mockRestore();
    });
  });
});
