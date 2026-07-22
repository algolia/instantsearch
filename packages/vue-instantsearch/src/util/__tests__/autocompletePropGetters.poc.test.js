/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 *
 * PROOF-OF-CONCEPT: drives the REAL `createAutocompletePropGetters` from
 * `instantsearch-ui-components` through the Vue hooks runtime + React-style
 * createElement adapter, to check whether Vue can consume the shared,
 * hook-based autocomplete controller (approach 3).
 */

import { createAutocompletePropGetters } from 'instantsearch-ui-components';

import { mount } from '../../../test/utils';
import { createHooksStore } from '../hooks';
import { renderReactCompat } from '../vue-compat';

function buildComboboxComponent({ hits, onSelect, onRefine }) {
  return {
    created() {
      this.hooksStore = createHooksStore(() => this.$forceUpdate());
      this.usePropGetters = createAutocompletePropGetters(
        this.hooksStore.hooks
      );
    },
    mounted() {
      this.hooksStore.flushEffects();
    },
    updated() {
      this.hooksStore.flushEffects();
    },
    beforeDestroy() {
      this.hooksStore.cleanup();
    },
    beforeUnmount() {
      this.hooksStore.cleanup();
    },
    // `renderReactCompat` supplies a React-style `createElement` (className +
    // onX events + MutableRef bridging) — the promoted vue-compat infra.
    render: renderReactCompat(function (h) {
      this.hooksStore.beginRender();

      const {
        getInputProps,
        getItemProps,
        getPanelProps,
        getRootProps,
        focusInput,
      } = this.usePropGetters({
        indices: [{ indexName: 'idx', indexId: 'idx', hits }],
        indicesConfig: [{ indexName: 'idx', getQuery: (item) => item.name }],
        onRefine: onRefine || (() => {}),
        onSelect: onSelect || (() => {}),
        onApply: () => {},
      });

      this.focusInput = focusInput;

      const tree = h(
        'div',
        getRootProps(),
        h(
          'form',
          { role: 'search' },
          h('input', getInputProps()),
          h(
            'button',
            {
              type: 'reset',
              // mirrors the shared AutocompleteSearch reset behavior
              onClick: () => {
                onRefine && onRefine('');
                focusInput();
              },
            },
            'clear'
          )
        ),
        h(
          'div',
          getPanelProps(),
          hits.map((hit, index) => {
            const itemProps = getItemProps(
              { __indexName: 'idx', ...hit },
              index
            );
            return h(
              'div',
              {
                key: hit.objectID,
                id: itemProps.id,
                role: itemProps.role,
                'aria-selected': itemProps['aria-selected'],
                className: 'ais-AutocompleteIndexItem',
                onClick: itemProps.onSelect,
              },
              hit.name
            );
          })
        )
      );

      this.hooksStore.endRender();
      return tree;
    }),
  };
}

describe('Autocomplete prop getters driven by Vue (PoC)', () => {
  const hits = [
    { objectID: '1', name: 'Item 1' },
    { objectID: '2', name: 'Item 2' },
  ];

  it('opens the panel on focus and closes on Escape', async () => {
    const wrapper = mount(buildComboboxComponent({ hits }), {
      attachTo: document.body,
    });
    const input = wrapper.find('input');
    const panel = wrapper.find('[role="grid"]');

    // Closed initially. Assert on the DOM `.hidden` property, which is robust
    // across Vue 2 (`hidden="hidden"`) and Vue 3 (`hidden=""`) serialization.
    expect(input.attributes('aria-expanded')).toBe('false');
    expect(panel.element.hidden).toBe(true);

    await input.trigger('focus');
    expect(input.attributes('aria-expanded')).toBe('true');
    expect(panel.element.hidden).toBe(false);

    await input.trigger('keydown', { key: 'Escape' });
    expect(input.attributes('aria-expanded')).toBe('false');
  });

  it('navigates items with the keyboard and sets aria-activedescendant', async () => {
    const wrapper = mount(buildComboboxComponent({ hits }), {
      attachTo: document.body,
    });
    const input = wrapper.find('input');

    await input.trigger('focus');

    expect(wrapper.findAll('[aria-selected="true"]').length).toBe(0);

    await input.trigger('keydown', { key: 'ArrowDown' });

    const selected = wrapper.find('[aria-selected="true"]');
    expect(selected.exists()).toBe(true);
    expect(selected.text()).toBe('Item 1');
    expect(input.attributes('aria-activedescendant')).toBe(
      selected.attributes('id')
    );

    await input.trigger('keydown', { key: 'ArrowDown' });
    expect(wrapper.find('[aria-selected="true"]').text()).toBe('Item 2');
  });

  it('selecting an item via Enter calls onSelect (through the ref-backed submit)', async () => {
    const onSelect = jest.fn();
    const wrapper = mount(buildComboboxComponent({ hits, onSelect }), {
      attachTo: document.body,
    });
    const input = wrapper.find('input');

    await input.trigger('focus');
    await input.trigger('keydown', { key: 'ArrowDown' });
    await input.trigger('keydown', { key: 'Enter' });

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        item: expect.objectContaining({ objectID: '1', name: 'Item 1' }),
      })
    );
  });

  it('populates the input ref (focusInput works)', async () => {
    const wrapper = mount(
      buildComboboxComponent({ hits, onRefine: jest.fn() }),
      {
        attachTo: document.body,
      }
    );
    const inputEl = wrapper.find('input').element;

    // The ref must have been populated with the real DOM node for focusInput
    // to work — this is the Vue-2 vnode-hook ref bridge under test.
    wrapper.vm.focusInput();
    expect(document.activeElement).toBe(inputEl);
  });
});
