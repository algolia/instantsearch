/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { Chat } from 'instantsearch.js/es/lib/chat';

import { mount, nextTick } from '../../../test/utils';
import ChatComponent from '../Chat';
import ChatTrigger from '../ChatTrigger';
import InstantSearch from '../InstantSearch';

jest.unmock('instantsearch.js/es');

const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

let wrapper;

afterEach(() => {
  if (wrapper) {
    wrapper.destroy();
    wrapper = undefined;
  }
  document.body.innerHTML = '';
  sessionStorage.clear();
});

function mountChat(chat, chatProps = {}) {
  wrapper = mount(
    {
      components: { InstantSearch, ChatComponent, ChatTrigger },
      data() {
        return {
          searchClient: createSearchClient(),
          // `connectChat` requires an `agentId`/`transport` even when a `chat`
          // instance is supplied (see makeChatInstance), matching the common
          // tests' `createDefaultWidgetParams`. `requiresSearch: false` keeps
          // these behavioral assertions independent of the main search.
          chatProps: {
            agentId: 'agentId',
            requiresSearch: false,
            chat,
            ...chatProps,
          },
        };
      },
      template: `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          <ChatTrigger />
          <ChatComponent v-bind="chatProps" />
        </InstantSearch>
      `,
    },
    { attachTo: document.body }
  );
  return wrapper;
}

const textMessage = (text) => ({
  id: 'm1',
  role: 'assistant',
  parts: [{ type: 'text', text }],
});

const carouselMessage = () => ({
  id: 'm2',
  role: 'assistant',
  parts: [
    {
      type: 'tool-algolia_search_index',
      toolCallId: 'tool-call-1',
      state: 'output-available',
      input: { query: 'products' },
      output: {
        hits: [
          { objectID: '1', name: 'Product 1', __position: 1 },
          { objectID: '2', name: 'Product 2', __position: 2 },
          { objectID: '3', name: 'Product 3', __position: 3 },
        ],
        nbHits: 100,
      },
    },
  ],
});

describe('AisChat', () => {
  it('renders a trigger and opens the chat on click', async () => {
    const chat = new Chat({});
    mountChat(chat);

    await wait(0);
    await nextTick();

    const toggle = document.querySelector('.ais-ChatToggleButton');
    expect(toggle).not.toBeNull();
    expect(document.querySelector('.ais-Chat-container--open')).toBeNull();

    toggle.click();
    await wait(0);
    await nextTick();

    expect(document.querySelector('.ais-Chat')).not.toBeNull();
    expect(document.querySelector('.ais-ChatPrompt-textarea')).not.toBeNull();
    expect(document.querySelector('.ais-Chat-container--open')).not.toBeNull();
  });

  it('submits the prompt via the connector sendMessage', async () => {
    const chat = new Chat({});
    const sendMessage = jest
      .spyOn(chat, 'sendMessage')
      .mockImplementation(() => Promise.resolve());

    mountChat(chat);
    await wait(0);
    await nextTick();
    document.querySelector('.ais-ChatToggleButton').click();
    await wait(0);
    await nextTick();

    const textarea = document.querySelector('.ais-ChatPrompt-textarea');
    textarea.value = 'hello';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();

    document.querySelector('.ais-ChatPrompt-submit').click();
    await wait(0);
    await nextTick();

    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'hello' })
    );
  });

  it('renders a pre-seeded assistant message', async () => {
    const chat = new Chat({ messages: [textMessage('Hello from Algolia')] });
    mountChat(chat);

    await wait(0);
    await nextTick();
    document.querySelector('.ais-ChatToggleButton').click();
    await wait(0);
    await nextTick();

    expect(
      document.querySelectorAll('.ais-ChatMessage').length
    ).toBeGreaterThan(0);
    expect(document.querySelector('.ais-ChatMessages').textContent).toContain(
      'Hello from Algolia'
    );
  });

  it('renders a search-tool carousel (reuses AisCarousel)', async () => {
    const chat = new Chat({ messages: [carouselMessage()] });
    mountChat(chat);

    await wait(0);
    await nextTick();
    document.querySelector('.ais-ChatToggleButton').click();
    await wait(0);
    await nextTick();

    expect(document.querySelector('.ais-Carousel')).not.toBeNull();
    expect(
      document.querySelectorAll('.ais-Carousel-item').length
    ).toBeGreaterThan(0);
  });
});
