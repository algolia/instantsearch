/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { mount } from '../../../test/utils';
import { renderReactCompat } from '../../util/vue-compat';
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

  it('forwards undeclared attributes to the shared root', () => {
    wrapper = mount(ChatGreeting, {
      attachTo: document.body,
      attrs: {
        id: 'greeting',
        'aria-labelledby': 'conversation-heading',
        'data-testid': 'greeting',
      },
    });

    const root = document.querySelector('.ais-ChatGreeting');
    expect(root).not.toBeNull();
    expect(root.getAttribute('id')).toBe('greeting');
    expect(root.getAttribute('aria-labelledby')).toBe('conversation-heading');
    expect(root.getAttribute('data-testid')).toBe('greeting');
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
    // A piece the layout renders in place of its header/messages/prompt. Defined
    // through `renderReactCompat` so one definition works on both versions:
    // Vue 2 hands a component's `render` the `createElement`, Vue 3 hands it the
    // instance proxy.
    const piece = (testId) => ({
      render: renderReactCompat(function (h) {
        return h('div', { 'data-testid': testId });
      }),
    });

    wrapper = mount(component, {
      attachTo: document.body,
      propsData: {
        ...(name === 'AisChatInlineLayout'
          ? {}
          : { open: true, maximized: false }),
        headerComponent: piece('header'),
        messagesComponent: piece('messages'),
        promptComponent: piece('prompt'),
      },
    });

    expect(wrapper.find(`.${layoutClass}`).exists()).toBe(true);
    expect(wrapper.find('.ais-Chat-container').exists()).toBe(true);
    expect(document.querySelector('[data-testid="header"]')).not.toBeNull();
    expect(document.querySelector('[data-testid="messages"]')).not.toBeNull();
    expect(document.querySelector('[data-testid="prompt"]')).not.toBeNull();
  });

  it('renders pieces whose render comes from a mixin or a setup()', () => {
    // A component whose `render` arrives through a mixin — which is what a
    // single-file component or a `setup()` definition looks like to the layout:
    // an options object with no own `render` key. Spotting components by
    // looking for `render` drops these, so they have to be rendered in tag
    // position whatever they carry.
    const withRender = (testId) => ({
      mixins: [
        {
          render: renderReactCompat(function (h) {
            return h('div', { 'data-testid': testId });
          }),
        },
      ],
    });

    wrapper = mount(component, {
      attachTo: document.body,
      propsData: {
        ...(name === 'AisChatInlineLayout'
          ? {}
          : { open: true, maximized: false }),
        headerComponent: withRender('header'),
        messagesComponent: { setup: () => ({}), ...withRender('messages') },
        promptComponent: () => 'ask away',
      },
    });

    expect(document.querySelector('[data-testid="header"]')).not.toBeNull();
    expect(document.querySelector('[data-testid="messages"]')).not.toBeNull();
    expect(document.querySelector('.ais-Chat-container').textContent).toContain(
      'ask away'
    );
  });
});

describe.each([
  ['AisChatGreeting', ChatGreeting, 'ais-ChatGreeting'],
  ['AisChatMessageLoader', ChatMessageLoader, 'ais-ChatMessageLoader'],
  ['AisChatOverlayLayout', ChatOverlayLayout, 'ais-ChatOverlayLayout'],
  ['AisChatInlineLayout', ChatInlineLayout, 'ais-ChatInlineLayout'],
  ['AisChatSidePanelLayout', ChatSidePanelLayout, 'ais-ChatSidePanelLayout'],
])('%s', (name, component, rootClass) => {
  let wrapper;

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
      wrapper = undefined;
    }
    document.body.innerHTML = '';
  });

  it('keeps a class binding on the shared root', () => {
    // On Vue 3 `class` arrives through `$attrs`, which `inheritAttrs: false`
    // keeps off the root, and the shared component's own `className` wins over
    // a second one — the binding has to reach the factory instead.
    wrapper = mount(
      {
        components: { Widget: component },
        data: () => ({ maximized: true }),
        template: `<Widget
          class="string-class"
          :class="[{ 'object-class': maximized }, 'array-class']"
        />`,
      },
      { attachTo: document.body }
    );

    const root = document.querySelector(`.${rootClass}`);

    expect(root).not.toBeNull();
    expect(root.classList.contains('string-class')).toBe(true);
    expect(root.classList.contains('object-class')).toBe(true);
    expect(root.classList.contains('array-class')).toBe(true);
  });
});

// Every chat widget with a shared root takes `classNames`, except the loader,
// which composes a plain `className` instead — that one is covered on the
// helper directly, in `util/__tests__/rootClass.test.js`.
describe.each([
  ['AisChatGreeting', ChatGreeting, 'ais-ChatGreeting'],
  ['AisChatOverlayLayout', ChatOverlayLayout, 'ais-ChatOverlayLayout'],
  ['AisChatInlineLayout', ChatInlineLayout, 'ais-ChatInlineLayout'],
  ['AisChatSidePanelLayout', ChatSidePanelLayout, 'ais-ChatSidePanelLayout'],
])('%s', (name, component, rootClass) => {
  let wrapper;

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
      wrapper = undefined;
    }
    document.body.innerHTML = '';
  });

  it('keeps an array-valued root class next to a class binding', () => {
    // `classNames.root` accepts a list, and folding the class binding in next
    // to it must not stringify that list with commas: `first,second` is one
    // class, so neither entry would match.
    wrapper = mount(
      {
        components: { Widget: component },
        template: `<Widget
          :class-names="{ root: ['first-class', 'second-class'] }"
          class="extra-class"
        />`,
      },
      { attachTo: document.body }
    );

    const root = document.querySelector(`.${rootClass}`);

    expect(root).not.toBeNull();
    expect(root.classList.contains('first-class')).toBe(true);
    expect(root.classList.contains('second-class')).toBe(true);
    expect(root.classList.contains('extra-class')).toBe(true);
  });
});
