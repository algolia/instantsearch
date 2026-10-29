/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { mount, nextTick } from '../../../test/utils';
import { createHooksStore } from '../hooks';
import { renderCompat, renderReactCompat } from '../vue-compat';

function makeHookedComponent(useBody) {
  return {
    created() {
      this.hooksStore = createHooksStore(() => this.$forceUpdate());
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
    render: renderCompat(function (h) {
      this.hooksStore.beginRender();
      const vnode = useBody(this.hooksStore.hooks, h);
      this.hooksStore.endRender();
      return vnode;
    }),
  };
}

describe('Vue hooks runtime', () => {
  it('useState re-renders on update and persists across renders', async () => {
    const Counter = makeHookedComponent((hooks, h) => {
      const [count, setCount] = hooks.useState(0);
      return h(
        'button',
        {
          attrs: { 'data-count': count },
          on: { click: () => setCount((prev) => prev + 1) },
        },
        [`count: ${count}`]
      );
    });

    const wrapper = mount(Counter);
    expect(wrapper.find('button').text()).toBe('count: 0');

    await wrapper.find('button').trigger('click');
    expect(wrapper.find('button').text()).toBe('count: 1');

    await wrapper.find('button').trigger('click');
    expect(wrapper.find('button').text()).toBe('count: 2');
  });

  it('useState returns the same setter on every render', async () => {
    const setters = [];
    const Counter = makeHookedComponent((hooks, h) => {
      const [count, setCount] = hooks.useState(0);
      setters.push(setCount);
      return h('button', { on: { click: () => setCount(count + 1) } }, [
        `count: ${count}`,
      ]);
    });

    const wrapper = mount(Counter);
    await wrapper.find('button').trigger('click');

    expect(wrapper.find('button').text()).toBe('count: 1');
    expect(setters).toHaveLength(2);
    expect(setters[1]).toBe(setters[0]);
  });

  it('useEffect runs after commit and re-runs only when deps change', async () => {
    const effectSpy = jest.fn();
    const cleanupSpy = jest.fn();

    const Component = makeHookedComponent((hooks, h) => {
      const [count, setCount] = hooks.useState(0);
      const [other, setOther] = hooks.useState(0);

      hooks.useEffect(() => {
        effectSpy(count);
        return cleanupSpy;
      }, [count]);

      return h('div', {}, [
        h('button', {
          attrs: { id: 'inc-count' },
          on: { click: () => setCount((p) => p + 1) },
        }),
        h('button', {
          attrs: { id: 'inc-other' },
          on: { click: () => setOther((p) => p + 1) },
        }),
        h('span', {}, [`${count}-${other}`]),
      ]);
    });

    const wrapper = mount(Component);

    // Runs once after initial mount
    expect(effectSpy).toHaveBeenCalledTimes(1);
    expect(effectSpy).toHaveBeenLastCalledWith(0);
    expect(cleanupSpy).not.toHaveBeenCalled();

    // Changing an unrelated state does NOT re-run the effect
    await wrapper.find('#inc-other').trigger('click');
    expect(effectSpy).toHaveBeenCalledTimes(1);

    // Changing the tracked dep re-runs the effect (after cleanup)
    await wrapper.find('#inc-count').trigger('click');
    expect(cleanupSpy).toHaveBeenCalledTimes(1);
    expect(effectSpy).toHaveBeenCalledTimes(2);
    expect(effectSpy).toHaveBeenLastCalledWith(1);
  });

  it('runs the effects of a render that re-rendered before they flushed', async () => {
    const effectSpy = jest.fn();

    const wrapper = mount({
      data: () => ({ count: 0 }),
      created() {
        this.hooksStore = createHooksStore(() => this.$forceUpdate());
      },
      mounted() {
        this.hooksStore.flushEffects();
      },
      updated() {
        this.hooksStore.flushEffects();
      },
      render: renderReactCompat(function (h) {
        this.hooksStore.beginRender();
        const [, setElement] = this.hooksStore.hooks.useState(null);
        const { count } = this;
        this.hooksStore.hooks.useEffect(() => {
          effectSpy(count);
        }, [count]);
        this.hooksStore.endRender();

        // The callback ref sets state during the patch, so the component
        // renders again before `updated` flushes the effects.
        return h('div', {}, count > 0 ? h('span', { ref: setElement }) : null);
      }),
    });

    expect(effectSpy).toHaveBeenLastCalledWith(0);

    await wrapper.setData({ count: 1 });
    await nextTick();

    expect(effectSpy).toHaveBeenLastCalledWith(1);
  });

  it('useRef and useMemo persist values across renders', async () => {
    const factorySpy = jest.fn((v) => ({ doubled: v * 2 }));

    const Component = makeHookedComponent((hooks, h) => {
      const [count, setCount] = hooks.useState(1);
      const renderCountRef = hooks.useRef(0);
      renderCountRef.current += 1;
      const memoized = hooks.useMemo(() => factorySpy(count), [count]);

      return h('div', {}, [
        h('span', { attrs: { id: 'renders' } }, [`${renderCountRef.current}`]),
        h('span', { attrs: { id: 'memo' } }, [`${memoized.doubled}`]),
        h('button', {
          attrs: { id: 'inc' },
          on: { click: () => setCount((p) => p + 1) },
        }),
        h('button', {
          attrs: { id: 'force' },
          on: { click: () => setCount((p) => p) }, // no-op value: won't re-render
        }),
      ]);
    });

    const wrapper = mount(Component);
    expect(wrapper.find('#renders').text()).toBe('1');
    expect(wrapper.find('#memo').text()).toBe('2');
    expect(factorySpy).toHaveBeenCalledTimes(1);

    await wrapper.find('#inc').trigger('click');
    expect(wrapper.find('#renders').text()).toBe('2');
    expect(wrapper.find('#memo').text()).toBe('4');
    // memo recomputed because dep changed
    expect(factorySpy).toHaveBeenCalledTimes(2);
  });

  it('cleanup runs on unmount', async () => {
    const cleanupSpy = jest.fn();

    const Component = makeHookedComponent((hooks, h) => {
      hooks.useEffect(() => cleanupSpy, []);
      return h('div', {}, ['x']);
    });

    const wrapper = mount(Component);
    expect(cleanupSpy).not.toHaveBeenCalled();

    wrapper.destroy();
    expect(cleanupSpy).toHaveBeenCalledTimes(1);
  });

  it('useId is unique across instances and stable across renders', async () => {
    const Component = makeHookedComponent((hooks, h) => {
      const [count, setCount] = hooks.useState(0);
      const inputId = hooks.useId();
      const panelId = hooks.useId();

      return h('div', {}, [
        h('input', { attrs: { id: inputId, 'aria-controls': panelId } }),
        h('div', {
          class: 'panel',
          attrs: { id: panelId, 'data-count': count },
        }),
        h('button', { on: { click: () => setCount((p) => p + 1) } }),
      ]);
    });

    const first = mount(Component);
    const second = mount(Component);

    const idsOf = (wrapper) => ({
      input: wrapper.find('input').attributes('id'),
      panel: wrapper.find('.panel').attributes('id'),
    });
    const firstIds = idsOf(first);
    const secondIds = idsOf(second);

    // Two call sites in one instance get two ids…
    expect(firstIds.input).not.toBe(firstIds.panel);
    // …and two instances never share one (each would otherwise start at 0,
    // making `aria-controls` point at the other widget's panel).
    expect(secondIds.input).not.toBe(firstIds.input);
    expect(secondIds.panel).not.toBe(firstIds.panel);
    expect(first.find('input').attributes('aria-controls')).toBe(
      firstIds.panel
    );

    // Ids are allocated once per call site and survive re-renders.
    await first.find('button').trigger('click');
    expect(first.find('.panel').attributes('data-count')).toBe('1');
    expect(idsOf(first)).toEqual(firstIds);
  });
});
