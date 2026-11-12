/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { mount } from '../../../test/utils';
import ChatGreeting from '../ChatGreeting';
import ChatInlineLayout from '../ChatInlineLayout';
import ChatMessageLoader from '../ChatMessageLoader';
import ChatOverlayLayout from '../ChatOverlayLayout';
import ChatSidePanelLayout from '../ChatSidePanelLayout';

jest.unmock('instantsearch-core');

describe('AisChatGreeting', () => {
  let wrapper;

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
      wrapper = undefined;
    }
    document.body.innerHTML = '';
  });

  it('renders the shared greeting markup with default translations', () => {
    wrapper = mount(ChatGreeting, { attachTo: document.body });

    expect(wrapper.find('.ais-ChatGreeting').exists()).toBe(true);
    expect(wrapper.find('.ais-ChatGreeting-heading').text()).toBe(
      'How can I help you today?'
    );
    expect(wrapper.find('.ais-ChatGreeting-subheading').exists()).toBe(true);
  });

  it('renders translations and a banner', () => {
    wrapper = mount(ChatGreeting, {
      attachTo: document.body,
      propsData: {
        banner: 'banner.png',
        translations: { heading: 'Bonjour', subheading: 'Comment aider ?' },
      },
    });

    expect(wrapper.find('.ais-ChatGreeting-banner').attributes('src')).toBe(
      'banner.png'
    );
    expect(wrapper.find('.ais-ChatGreeting-heading').text()).toBe('Bonjour');
    expect(wrapper.find('.ais-ChatGreeting-subheading').text()).toBe(
      'Comment aider ?'
    );
  });
});

describe('AisChatMessageLoader', () => {
  let wrapper;

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
      wrapper = undefined;
    }
    document.body.innerHTML = '';
  });

  it('renders the shared loader skeleton', () => {
    wrapper = mount(ChatMessageLoader, { attachTo: document.body });

    expect(wrapper.find('.ais-ChatMessageLoader').exists()).toBe(true);
    expect(wrapper.find('.ais-ChatMessageLoader-spinner').exists()).toBe(true);
    expect(wrapper.findAll('.ais-ChatMessageLoader-skeletonItem')).toHaveLength(
      2
    );
  });

  it('renders inline without the message chrome and forwards extra props', () => {
    wrapper = mount(ChatMessageLoader, {
      attachTo: document.body,
      propsData: { inline: true },
      attrs: { context: { status: 'streaming' } },
    });

    expect(wrapper.find('.ais-ChatMessageLoader--inline').exists()).toBe(true);
    expect(wrapper.find('.ais-ChatMessage-container').exists()).toBe(false);
  });
});

describe.each([
  ['AisChatOverlayLayout', ChatOverlayLayout, 'ais-ChatOverlayLayout'],
  ['AisChatInlineLayout', ChatInlineLayout, 'ais-ChatInlineLayout'],
  ['AisChatSidePanelLayout', ChatSidePanelLayout, 'ais-ChatSidePanelLayout'],
])('%s', (name, component, layoutClass) => {
  let wrapper;

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
      wrapper = undefined;
    }
    document.body.innerHTML = '';
  });

  it('renders the shared layout with the chat pieces inside the container', () => {
    const HeaderComponent = {
      render(h) {
        return h('div', { attrs: { 'data-testid': 'header' } });
      },
    };
    const MessagesComponent = {
      render(h) {
        return h('div', { attrs: { 'data-testid': 'messages' } });
      },
    };
    const PromptComponent = {
      render(h) {
        return h('div', { attrs: { 'data-testid': 'prompt' } });
      },
    };

    wrapper = mount(component, {
      attachTo: document.body,
      propsData: {
        ...(name === 'AisChatInlineLayout'
          ? {}
          : { open: true, maximized: false }),
        headerComponent: HeaderComponent,
        messagesComponent: MessagesComponent,
        promptComponent: PromptComponent,
      },
    });

    expect(wrapper.find(`.${layoutClass}`).exists()).toBe(true);
    expect(wrapper.find('.ais-Chat-container').exists()).toBe(true);
    expect(document.querySelector('[data-testid="header"]')).not.toBeNull();
    expect(document.querySelector('[data-testid="messages"]')).not.toBeNull();
    expect(document.querySelector('[data-testid="prompt"]')).not.toBeNull();
  });
});
