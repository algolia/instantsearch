/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { mount, nextTick } from '../../../test/utils';
import { __setState } from '../../mixins/widget';
import { renderReactCompat } from '../../util/vue-compat';
import PromptSuggestions from '../PromptSuggestions';

jest.mock('../../mixins/widget');

const SUGGESTIONS = ['Suggestion A', 'Suggestion B'];

/**
 * A `layoutComponent` passed as a Vue component object: it declares the props
 * the widget hands a layout, and calls `onSuggestionClick` itself. The
 * React-style `createElement` maps `onX` props onto listeners under a
 * lower-cased name, so this is the shape that stopped reaching the callback.
 */
const LayoutComponent = {
  name: 'LayoutComponent',
  props: {
    suggestions: { type: Array, required: false, default: () => [] },
    onSuggestionClick: { type: Function, required: false, default: undefined },
  },
  render: renderReactCompat(function (h) {
    return h(
      'div',
      { class: 'custom-layout' },
      this.suggestions.map((suggestion) =>
        h(
          'button',
          {
            key: suggestion,
            class: 'custom-layout-pill',
            onClick: () => this.onSuggestionClick(suggestion),
          },
          suggestion
        )
      )
    );
  }),
};

/** A `headerComponent` passed as a Vue component object, which can't be called. */
const HeaderComponent = {
  name: 'HeaderComponent',
  props: {
    classNames: { type: Object, required: false, default: () => ({}) },
    translations: { type: Object, required: false, default: () => ({}) },
  },
  render: renderReactCompat(function (h) {
    return h(
      'h2',
      { class: ['custom-header', this.classNames.header] },
      this.translations.headerTitle
    );
  }),
};

let wrapper;

beforeEach(() => {
  __setState({
    suggestions: SUGGESTIONS,
    isLoading: false,
    error: undefined,
    isChatBusy: false,
    sendToChat: jest.fn(() => true),
    onSuggestionClick: jest.fn(),
    refresh: jest.fn(),
  });
});

afterEach(() => {
  if (wrapper) {
    wrapper.destroy();
    wrapper = undefined;
  }
  document.body.innerHTML = '';
});

describe('AisPromptSuggestions', () => {
  it('gives a component-object layout its props and the click callback', async () => {
    const onSuggestionClick = jest.fn();

    wrapper = mount(PromptSuggestions, {
      attachTo: document.body,
      propsData: {
        agentId: 'agentId',
        onSuggestionClick,
        layoutComponent: LayoutComponent,
      },
    });
    await nextTick();

    const pills = document.querySelectorAll('.custom-layout-pill');
    expect(pills).toHaveLength(SUGGESTIONS.length);
    expect(pills[0].textContent).toBe('Suggestion A');

    pills[0].click();
    await nextTick();

    expect(onSuggestionClick).toHaveBeenCalledTimes(1);
    expect(onSuggestionClick).toHaveBeenCalledWith('Suggestion A', {
      sendToChat: expect.any(Function),
    });
  });

  it('renders a component-object headerComponent', async () => {
    wrapper = mount(PromptSuggestions, {
      attachTo: document.body,
      propsData: {
        agentId: 'agentId',
        headerComponent: HeaderComponent,
        translations: { headerTitle: 'Start with an idea' },
      },
    });
    await nextTick();

    // The default layout still renders the pills; only the header is replaced.
    expect(
      document.querySelectorAll('.ais-PromptSuggestions-suggestion')
    ).toHaveLength(SUGGESTIONS.length);
    expect(document.querySelector('.ais-PromptSuggestions-header')).toBeNull();

    const header = document.querySelector('.custom-header');
    expect(header).not.toBeNull();
    expect(header.textContent).toBe('Start with an idea');
  });

  it('applies the SUIT class names this widget documents', async () => {
    wrapper = mount(PromptSuggestions, {
      attachTo: document.body,
      propsData: {
        agentId: 'agentId',
        classNames: {
          'ais-PromptSuggestions': 'custom-root',
          'ais-PromptSuggestions-header': 'custom-header',
          'ais-PromptSuggestions-headerTitle': 'custom-title',
          'ais-PromptSuggestions-suggestion': 'custom-pill',
        },
      },
    });
    await nextTick();

    // The shared component reads short keys, so the SUIT names have to be
    // folded onto them — otherwise every one of these is silently ignored.
    const root = document.querySelector('.ais-PromptSuggestions');
    expect(root.classList.contains('custom-root')).toBe(true);
    // The SUIT keys are consumed by the mapping, not spread onto the markup.
    expect(root.className).toBe('ais-PromptSuggestions custom-root');

    const header = document.querySelector('.ais-PromptSuggestions-header');
    expect(header.classList.contains('custom-header')).toBe(true);
    expect(
      header
        .querySelector('.ais-PromptSuggestions-headerTitle')
        .classList.contains('custom-title')
    ).toBe(true);

    const [pill] = document.querySelectorAll(
      '.ais-PromptSuggestions-suggestion'
    );
    expect(pill.classList.contains('custom-pill')).toBe(true);
  });

  it('applies the short class names the shared component reads', async () => {
    // The shape the React flavor takes: accepted too, so it can't no-op.
    wrapper = mount(PromptSuggestions, {
      attachTo: document.body,
      propsData: {
        agentId: 'agentId',
        classNames: { root: 'short-root', suggestion: 'short-pill' },
      },
    });
    await nextTick();

    expect(
      document
        .querySelector('.ais-PromptSuggestions')
        .classList.contains('short-root')
    ).toBe(true);
    expect(
      document
        .querySelector('.ais-PromptSuggestions-suggestion')
        .classList.contains('short-pill')
    ).toBe(true);
  });

  it('maps the skeleton class names while loading', async () => {
    __setState({
      suggestions: [],
      isLoading: true,
      error: undefined,
      isChatBusy: false,
      sendToChat: jest.fn(() => true),
      onSuggestionClick: jest.fn(),
      refresh: jest.fn(),
    });

    wrapper = mount(PromptSuggestions, {
      attachTo: document.body,
      propsData: {
        agentId: 'agentId',
        classNames: {
          'ais-PromptSuggestions-skeleton': 'custom-skeleton',
          'ais-PromptSuggestions-skeletonItem': 'custom-skeleton-item',
        },
      },
    });
    await nextTick();

    const skeleton = document.querySelector('.ais-PromptSuggestions-skeleton');
    expect(skeleton).not.toBeNull();
    expect(skeleton.classList.contains('custom-skeleton')).toBe(true);
    expect(
      skeleton
        .querySelector('.ais-PromptSuggestions-skeletonItem')
        .classList.contains('custom-skeleton-item')
    ).toBe(true);
  });
});
