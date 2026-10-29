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

const defaultTemplate = `
  <InstantSearch :search-client="searchClient" index-name="indexName">
    <ChatTrigger />
    <ChatComponent v-bind="chatProps" ref="chat" />
  </InstantSearch>
`;

function mountChat(chat, chatProps = {}, template = defaultTemplate) {
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
      template,
    },
    { attachTo: document.body }
  );
  return wrapper;
}

async function openChat() {
  await wait(0);
  await nextTick();
  document.querySelector('.ais-ChatToggleButton').click();
  await wait(0);
  await nextTick();
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

// An agent-triggered comparison: a search call carrying the catalog hits,
// then a compare call naming the products by objectID with criteria rows.
const compareMessage = () => ({
  id: 'm3',
  role: 'assistant',
  parts: [
    {
      type: 'tool-algolia_search_index',
      toolCallId: 'search',
      state: 'output-available',
      input: {},
      output: {
        hits: [
          { objectID: 'A', name: 'Galaxy A50' },
          { objectID: 'B', name: 'OnePlus 6T' },
        ],
      },
    },
    {
      type: 'tool-algolia_compare_products',
      toolCallId: 'compare',
      state: 'input-available',
      input: {
        objectIDs: ['A', 'B'],
        criteria: [
          { label: 'Price', values: ['$199', '$299'] },
          { label: 'Rating', values: [4, 5] },
        ],
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
    await openChat();

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
    await openChat();

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
    await openChat();

    expect(document.querySelector('.ais-Carousel')).not.toBeNull();
    expect(
      document.querySelectorAll('.ais-Carousel-item').length
    ).toBeGreaterThan(0);
    expect(
      document.querySelector('.ais-ChatToolSearchIndexCarouselHeaderCount')
        .textContent
    ).toBe('3 of 100 results');
  });

  it('renders the compare-products tool as a comparison table', async () => {
    const chat = new Chat({ messages: [compareMessage()] });
    mountChat(chat);
    await openChat();

    const headers = Array.from(
      document.querySelectorAll('[role="columnheader"], th')
    ).map((cell) => cell.textContent.trim());
    expect(headers).toEqual(
      expect.arrayContaining(['Galaxy A50', 'OnePlus 6T'])
    );

    const text = document.querySelector('.ais-ChatMessages').textContent;
    expect(text).toContain('Price');
    expect(text).toContain('$199');
    expect(text).toContain('Rating');
  });

  it('renders the inline layout without a trigger', async () => {
    const chat = new Chat({ messages: [textMessage('Inline')] });
    mountChat(
      chat,
      { layout: 'inline' },
      `
      <InstantSearch :search-client="searchClient" index-name="indexName">
        <ChatComponent v-bind="chatProps" />
      </InstantSearch>
      `
    );

    await wait(0);
    await nextTick();

    expect(document.querySelector('.ais-ChatInlineLayout')).not.toBeNull();
    expect(document.querySelector('.ais-ChatOverlayLayout')).toBeNull();
    expect(document.querySelector('.ais-ChatMessages').textContent).toContain(
      'Inline'
    );
  });

  describe('slots', () => {
    it('renders the `item` slot in tool carousels', async () => {
      const chat = new Chat({ messages: [carouselMessage()] });
      mountChat(
        chat,
        {},
        `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          <ChatTrigger />
          <ChatComponent v-bind="chatProps">
            <template v-slot:item="{ item, sendEvent }">
              <span class="custom-item">{{ item.name }} {{ typeof sendEvent }}</span>
            </template>
          </ChatComponent>
        </InstantSearch>
        `
      );
      await openChat();

      const items = document.querySelectorAll(
        '.ais-Carousel-item .custom-item'
      );
      expect(items.length).toBe(3);
      expect(items[0].textContent).toBe('Product 1 function');
    });

    it('renders the `header` and `empty` slots', async () => {
      const chat = new Chat({});
      mountChat(
        chat,
        {},
        `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          <ChatTrigger />
          <ChatComponent v-bind="chatProps">
            <template v-slot:header="{ onClose }">
              <div class="custom-header">
                <button class="custom-close" @click="onClose">close</button>
              </div>
            </template>
            <template v-slot:empty>
              <p class="custom-empty">Ask me anything</p>
            </template>
          </ChatComponent>
        </InstantSearch>
        `
      );
      await openChat();

      expect(document.querySelector('.ais-ChatHeader')).toBeNull();
      expect(document.querySelector('.custom-header')).not.toBeNull();
      expect(document.querySelector('.custom-empty').textContent).toBe(
        'Ask me anything'
      );

      document.querySelector('.custom-close').click();
      await wait(0);
      await nextTick();

      expect(document.querySelector('.ais-Chat-container--open')).toBeNull();
    });
  });

  it('exposes setOpen, setInput and sendMessage on the component', async () => {
    const chat = new Chat({});
    const sendMessage = jest
      .spyOn(chat, 'sendMessage')
      .mockImplementation(() => Promise.resolve());

    mountChat(chat);
    await wait(0);
    await nextTick();

    const chatComponent = wrapper.vm.$refs.chat;

    chatComponent.setOpen(true);
    await wait(0);
    await nextTick();
    expect(document.querySelector('.ais-Chat-container--open')).not.toBeNull();

    chatComponent.setInput('from the outside');
    await wait(0);
    await nextTick();
    expect(document.querySelector('.ais-ChatPrompt-textarea').value).toBe(
      'from the outside'
    );

    chatComponent.sendMessage({ text: 'hello' });
    expect(sendMessage).toHaveBeenCalledWith({ text: 'hello' });
  });

  describe('widget stability', () => {
    // No custom `chat` and no message persistence: replacing the widget would
    // create a new internal Chat instance and drop the conversation.
    function mountWithInlineProps({ onError } = {}) {
      wrapper = mount(
        {
          components: { InstantSearch, ChatComponent },
          data() {
            return {
              searchClient: createSearchClient(),
              renders: 0,
              page: 'home',
            };
          },
          methods: {
            handleError(error) {
              if (onError) {
                onError(error, this.renders);
              }
            },
          },
          template: `
            <InstantSearch :search-client="searchClient" index-name="indexName">
              <span>{{ renders }}</span>
              <ChatComponent
                agent-id="agentId"
                layout="inline"
                :requires-search="false"
                :persistence="false"
                :context="{ page }"
                :tools="{ custom: { streamInput: true } }"
                :on-error="(error) => handleError(error)"
                ref="chat"
              />
            </InstantSearch>
          `,
        },
        { attachTo: document.body }
      );
      return wrapper;
    }

    async function seedConversation(chatComponent) {
      chatComponent.state.setMessages([
        { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'hi' }] },
      ]);
      await wait(0);
      await nextTick();
    }

    it('keeps the widget and conversation when the parent re-renders with inline props', async () => {
      mountWithInlineProps();
      await wait(0);
      await nextTick();

      const chatComponent = wrapper.vm.$refs.chat;
      const widget = chatComponent.widget;
      await seedConversation(chatComponent);

      wrapper.vm.renders++;
      await wait(0);
      await nextTick();

      expect(chatComponent.widget).toBe(widget);
      expect(chatComponent.state.messages).toHaveLength(1);
    });

    it('forwards inline callbacks to the latest handler', async () => {
      const onError = jest.fn();
      mountWithInlineProps({ onError });
      await wait(0);
      await nextTick();

      wrapper.vm.renders++;
      await wait(0);
      await nextTick();

      const error = new Error('boom');
      wrapper.vm.$refs.chat.widgetParams.onError(error);

      expect(onError).toHaveBeenCalledWith(error, 1);
    });

    it('still replaces the widget when a prop value changes', async () => {
      mountWithInlineProps();
      await wait(0);
      await nextTick();

      const chatComponent = wrapper.vm.$refs.chat;
      const widget = chatComponent.widget;

      wrapper.vm.page = 'product';
      await wait(0);
      await nextTick();

      expect(chatComponent.widget).not.toBe(widget);
      expect(chatComponent.widgetParams.context).toEqual({ page: 'product' });
    });

    it('treats component definitions as opaque, even once Vue caches a constructor on them', async () => {
      const layoutComponent = { render: (h) => h('div') };
      wrapper = mount(
        {
          components: { InstantSearch, ChatComponent },
          data() {
            return {
              searchClient: createSearchClient(),
              renders: 0,
              tools: { custom: { layoutComponent } },
            };
          },
          template: `
            <InstantSearch :search-client="searchClient" index-name="indexName">
              <span>{{ renders }}</span>
              <ChatComponent
                agent-id="agentId"
                :requires-search="false"
                :persistence="false"
                :tools="{ custom: { layoutComponent: tools.custom.layoutComponent } }"
                ref="chat"
              />
            </InstantSearch>
          `,
        },
        { attachTo: document.body }
      );
      await wait(0);
      await nextTick();

      const chatComponent = wrapper.vm.$refs.chat;
      const widget = chatComponent.widget;

      // What Vue 2 does to a component's options when it first renders it.
      layoutComponent._Ctor = {};
      wrapper.vm.renders++;
      await wait(0);
      await nextTick();

      expect(chatComponent.widget).toBe(widget);
    });

    it('replaces the widget when a nested value is mutated in place', async () => {
      wrapper = mount(
        {
          components: { InstantSearch, ChatComponent },
          data() {
            return {
              searchClient: createSearchClient(),
              requestOptions: { headers: { Authorization: 'old' } },
            };
          },
          template: `
            <InstantSearch :search-client="searchClient" index-name="indexName">
              <ChatComponent
                agent-id="agentId"
                :requires-search="false"
                :persistence="false"
                :request-options="requestOptions"
                ref="chat"
              />
            </InstantSearch>
          `,
        },
        { attachTo: document.body }
      );
      await wait(0);
      await nextTick();

      const chatComponent = wrapper.vm.$refs.chat;
      const widget = chatComponent.widget;

      wrapper.vm.requestOptions.headers.Authorization = 'new';
      await wait(0);
      await nextTick();

      expect(chatComponent.widget).not.toBe(widget);
    });

    it('ignores a callback that was removed after the widget was created', async () => {
      wrapper = mount(
        {
          components: { InstantSearch, ChatComponent },
          data() {
            return {
              searchClient: createSearchClient(),
              handler: jest.fn(),
            };
          },
          template: `
            <InstantSearch :search-client="searchClient" index-name="indexName">
              <ChatComponent
                agent-id="agentId"
                :requires-search="false"
                :persistence="false"
                :on-error="handler"
                ref="chat"
              />
            </InstantSearch>
          `,
        },
        { attachTo: document.body }
      );
      await wait(0);
      await nextTick();

      const chatComponent = wrapper.vm.$refs.chat;
      const { onError } = chatComponent.widgetParams;

      wrapper.vm.handler = undefined;
      await wait(0);
      await nextTick();

      expect(chatComponent.widgetParams.onError).toBeUndefined();
      expect(() => onError(new Error('late'))).not.toThrow();
    });
  });
});

describe('AisChatTrigger', () => {
  it('emits `click` and renders a custom toggle icon', async () => {
    const chat = new Chat({});
    const onClick = jest.fn();
    wrapper = mount(
      {
        components: { InstantSearch, ChatComponent, ChatTrigger },
        data() {
          return {
            searchClient: createSearchClient(),
            chatProps: { agentId: 'agentId', requiresSearch: false, chat },
            // Component overrides are render functions; a string is a valid
            // child too, which keeps this independent of the Vue version.
            toggleIcon: ({ isOpen }) =>
              isOpen ? 'custom open' : 'custom closed',
            onClick,
          };
        },
        template: `
          <InstantSearch :search-client="searchClient" index-name="indexName">
            <ChatTrigger
              :floating="false"
              :toggle-icon-component="toggleIcon"
              @click="onClick"
            />
            <ChatComponent v-bind="chatProps" />
          </InstantSearch>
        `,
      },
      { attachTo: document.body }
    );

    await wait(0);
    await nextTick();

    const toggle = document.querySelector('.ais-ChatToggleButton');
    expect(toggle.classList.contains('ais-ChatToggleButton--floating')).toBe(
      false
    );
    expect(toggle.textContent.trim()).toBe('custom closed');

    toggle.click();
    await wait(0);
    await nextTick();

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(document.querySelector('.ais-Chat-container--open')).not.toBeNull();
    expect(toggle.textContent.trim()).toBe('custom open');
  });
});
