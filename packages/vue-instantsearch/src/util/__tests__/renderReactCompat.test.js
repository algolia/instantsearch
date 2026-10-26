/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { mount } from '../../../test/utils';
import { isVue2, renderReactCompat } from '../vue-compat';

function mountReact(renderFn, data = {}) {
  return mount({
    data: () => data,
    render: renderReactCompat(function (h) {
      return renderFn.call(this, h);
    }),
  });
}

// Vue 3 itself never calls a replaced or removed function ref with `null`
// (only on unmount), so these React semantics are Vue 2 adapter behaviour.
const itVue2 = isVue2 ? it : it.skip;

describe('renderReactCompat', () => {
  describe('htmlFor', () => {
    it('renders `htmlFor` as the `for` attribute', () => {
      const wrapper = mountReact((h) =>
        h(
          'form',
          {},
          h('label', { htmlFor: 'input-id' }, 'Label'),
          h('input', { id: 'input-id' })
        )
      );

      const label = wrapper.find('label').element;
      expect(label.getAttribute('for')).toBe('input-id');
      expect(label.hasAttribute('htmlfor')).toBe(false);
      expect(label.hasAttribute('htmlFor')).toBe(false);
      expect(label.control).toBe(wrapper.find('input').element);
    });
  });

  describe('refs', () => {
    it('calls callback refs with the element on mount and null on unmount', async () => {
      const calls = [];
      // Vue 3 passes an extra refs object, so only keep the element.
      const ref = (element) => calls.push(element);
      const wrapper = mountReact(
        function (h) {
          return h('div', {}, this.show ? h('span', { ref }) : undefined);
        },
        { show: true }
      );

      expect(calls[calls.length - 1]).toBe(wrapper.find('span').element);

      await wrapper.setData({ show: false });
      expect(calls[calls.length - 1]).toBe(null);
    });

    it('re-runs callback refs on update so they see the latest closure', async () => {
      const seen = [];
      const wrapper = mountReact(
        function (h) {
          const { stalled } = this;
          return h('div', {
            ref: (element) => {
              if (element) {
                seen.push(stalled);
              }
            },
          });
        },
        { stalled: false }
      );

      expect(seen).toContain(false);

      await wrapper.setData({ stalled: true });
      expect(seen[seen.length - 1]).toBe(true);

      await wrapper.setData({ stalled: false });
      expect(seen[seen.length - 1]).toBe(false);
    });

    itVue2(
      'clears the previous callback ref when the callback changes',
      async () => {
        const events = [];
        const wrapper = mountReact(
          function (h) {
            const { id } = this;
            return h('div', {
              ref: (element) => events.push([id, element ? 'el' : null]),
            });
          },
          { id: 'a' }
        );

        events.length = 0;
        await wrapper.setData({ id: 'b' });

        expect(events).toEqual([
          ['a', null],
          ['b', 'el'],
        ]);
      }
    );

    itVue2('clears the callback ref when the ref is removed', async () => {
      const calls = [];
      const ref = (element) => calls.push(element ? 'el' : null);
      const wrapper = mountReact(
        function (h) {
          return h('div', this.withRef ? { ref } : {});
        },
        { withRef: true }
      );

      calls.length = 0;
      await wrapper.setData({ withRef: false });

      expect(calls).toEqual([null]);
    });

    it('populates MutableRefs on mount and clears them on unmount', async () => {
      const ref = { current: undefined };
      const wrapper = mountReact(
        function (h) {
          return h('div', {}, this.show ? h('span', { ref }) : undefined);
        },
        { show: true }
      );

      expect(ref.current).toBe(wrapper.find('span').element);

      await wrapper.setData({ show: false });
      expect(ref.current).toBe(null);
    });

    it('keeps MutableRefs pointing at the element across updates', async () => {
      const ref = { current: undefined };
      const wrapper = mountReact(
        function (h) {
          return h('div', { ref, 'data-n': this.n });
        },
        { n: 0 }
      );

      await wrapper.setData({ n: 1 });
      expect(ref.current).toBe(wrapper.find('div').element);
    });
  });
});
