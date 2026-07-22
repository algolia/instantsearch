/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { mount } from '../../../test/utils';
import { createHooksStore } from '../hooks';
import { renderCompat } from '../vue-compat';

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

describe('Vue hooks runtime (PoC)', () => {
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
});
