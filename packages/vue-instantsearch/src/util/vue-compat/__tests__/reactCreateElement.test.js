/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { defineAsyncComponent } from 'vue';

import { mount, nextTick } from '../../../../test/utils';
import { createApp, isVue3, renderReactCompat } from '../index';

// Attribute fall-through, the emit casing of `onKeydown`, and `app.mixin` are
// Vue 3 behaviour. Vue 2 lower-cases every listener name, never falls attributes
// through to a child root, and registers app-wide mixins through `Vue.mixin` —
// which would leak into every other test in this file.
const describeOnVue3 = isVue3 ? describe : describe.skip;

// The React-style renderer is how Vue consumes the shared
// `instantsearch-ui-components` markup, and it is also how a widget hands a
// callback to a user-provided override. Overrides are written the Vue way (a
// component object with declared props), while shared markup is written the
// React way (`onX` props) — so the renderer has to serve both.

let wrapper;

afterEach(() => {
  if (wrapper) {
    wrapper.destroy();
    wrapper = undefined;
  }
  document.body.innerHTML = '';
});

function mountComponent(component) {
  wrapper = mount(component, { attachTo: document.body });
  return wrapper;
}

describe('renderReactCompat', () => {
  it('passes a multi-word callback to a component as the prop it names', () => {
    const onToggleMaximize = jest.fn();
    const received = [];

    const Child = {
      props: {
        onToggleMaximize: { type: Function, default: undefined },
      },
      render: renderReactCompat(function (h) {
        received.push(this.onToggleMaximize);
        return h(
          'button',
          { onClick: () => this.onToggleMaximize('from the child') },
          'maximize'
        );
      }),
    };

    mountComponent({
      render: renderReactCompat(function (h) {
        return h(Child, { onToggleMaximize });
      }),
    });

    // Without the prop, `this.onToggleMaximize` is undefined here: Vue exposes
    // the callback as a `togglemaximize` listener instead.
    expect(received).toHaveLength(1);
    expect(received[0]).toBe(onToggleMaximize);

    document.querySelector('button').click();
    expect(onToggleMaximize).toHaveBeenCalledWith('from the child');
  });

  it('passes a single-word callback to a component as the prop it names', () => {
    const onClose = jest.fn();

    const Child = {
      props: { onClose: { type: Function, default: undefined } },
      render: renderReactCompat(function (h) {
        return h('button', { onClick: () => this.onClose() }, 'close');
      }),
    };

    mountComponent({
      render: renderReactCompat(function (h) {
        return h(Child, { onClose });
      }),
    });

    document.querySelector('button').click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls a declared callback once when the child binds it to its own root', () => {
    const onKeyDown = jest.fn();

    const Child = {
      props: { onKeyDown: { type: Function, default: undefined } },
      render: renderReactCompat(function (h) {
        // The child takes the callback as a prop and binds it itself, the way a
        // custom prompt or search box does. The callback must not also arrive
        // as a listener on this element, which would run it twice per key.
        return h('input', {
          id: 'child-input',
          onKeyDown: (event) => this.onKeyDown(event),
        });
      }),
    };

    mountComponent({
      render: renderReactCompat(function (h) {
        return h(Child, { onKeyDown });
      }),
    });

    document
      .getElementById('child-input')
      .dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));

    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });

  it('keeps the callback reachable for a child that declares the event in emits', () => {
    const onKeyDown = jest.fn();

    const Child = {
      // Declares both the prop it could call itself and the event it emits.
      // Vue resolves `$emit('keydown')` through the lower-cased handler key,
      // not through the declared prop, and a declared emit keeps that key from
      // falling through to the root — so the callback has to stay reachable
      // without also running twice.
      props: { onKeyDown: { type: Function, default: undefined } },
      emits: ['keydown'],
      render: renderReactCompat(function (h) {
        return h(
          'button',
          { onClick: () => this.$emit('keydown', 'emitted') },
          'child'
        );
      }),
    };

    mountComponent({
      render: renderReactCompat(function (h) {
        return h(Child, { onKeyDown });
      }),
    });

    document.querySelector('button').click();
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(onKeyDown).toHaveBeenCalledWith('emitted');
  });

  it('keeps the callback reachable through $listeners and emits', () => {
    const onClose = jest.fn();

    const Child = {
      // No declared props: a child built on `$listeners` (Vue 2) or on emitting
      // the event (Vue 3) must keep working, as our own components rely on it.
      render: renderReactCompat(function (h) {
        return h(
          'button',
          { onClick: () => this.$emit('close', 'emitted') },
          'close'
        );
      }),
    };

    mountComponent({
      render: renderReactCompat(function (h) {
        return h(Child, { onClose });
      }),
    });

    document.querySelector('button').click();
    expect(onClose).toHaveBeenCalledWith('emitted');
  });

  it('does not render a callback the child does not declare', () => {
    const Child = {
      // Inherits attributes onto its root, the way `inheritAttrs: false` +
      // `v-bind="$attrs"` forwarding would.
      render: renderReactCompat(function (h) {
        return h('div', { id: 'child-root' }, 'child');
      }),
    };

    mountComponent({
      render: renderReactCompat(function (h) {
        return h(Child, {
          onClose: () => {},
          onToggleMaximize: () => {},
        });
      }),
    });

    const root = document.getElementById('child-root');
    expect(root.getAttribute('onClose')).toBeNull();
    expect(root.getAttribute('onToggleMaximize')).toBeNull();
    expect(root.outerHTML).not.toContain('function');
  });

  it('binds callbacks on elements as DOM listeners', () => {
    const onClick = jest.fn();

    mountComponent({
      render: renderReactCompat(function (h) {
        return h('button', { id: 'element', onClick }, 'click');
      }),
    });

    const element = document.getElementById('element');
    element.click();

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(element.getAttribute('onClick')).toBeNull();
  });

  describeOnVue3('the emit and fall-through behaviour of Vue 3', () => {
    // Vue resolves `$emit(event)` by looking `on<Event>` up on the vnode, so a
    // child that emits the event needs that key — in either of the two spellings
    // Vue itself accepts for a declared emit.

    it.each([
      ['keyDown', 'camelCase'],
      ['key-down', 'kebab-case'],
    ])(
      'reaches a child that declares the emitted event as %s',
      async (declared) => {
        const onKeyDown = jest.fn();

        const Child = {
          props: { onKeyDown: { type: Function, default: undefined } },
          emits: [declared],
          render: renderReactCompat(function (h) {
            return h(
              'button',
              { onClick: () => this.$emit(declared, 'emitted') },
              'child'
            );
          }),
        };

        mountComponent({
          render: renderReactCompat(function (h) {
            return h(Child, { onKeyDown });
          }),
        });

        document.querySelector('button').click();
        expect(onKeyDown).toHaveBeenCalledTimes(1);
        expect(onKeyDown).toHaveBeenCalledWith('emitted');
      }
    );

    it('takes the callback through the prop when a child emits an undeclared event', () => {
      const onKeyDown = jest.fn();

      const Child = {
        props: { onKeyDown: { type: Function, default: undefined } },
        // No `emits` here: Vue warns about this emit in development, asking for
        // the event to be declared, or taken as an `onKeydown` prop.
        render: renderReactCompat(function (h) {
          return h(
            'button',
            { onClick: () => this.$emit('keydown', 'undeclared') },
            'child'
          );
        }),
      };

      mountComponent({
        render: renderReactCompat(function (h) {
          return h(Child, { onKeyDown });
        }),
      });

      document.querySelector('button').click();

      // The handler key is what `$emit('keydown')` resolves, and it is the same
      // key that falls through to this child's root as a listener — so a child
      // declaring the prop does not get it. That is the trade: a child taking the
      // callback as a prop calls the prop, and one that emits declares the event,
      // which is also what Vue’s own warning asks of it.
      expect(onKeyDown).not.toHaveBeenCalled();
    });

    it('counts the prop declared by a resolved async component once', async () => {
      const onKeyDown = jest.fn();

      const Inner = {
        props: { onKeyDown: { type: Function, default: undefined } },
        render: renderReactCompat(function (h) {
          return h('input', {
            id: 'async-input',
            // An override loaded lazily, binding the callback it declared.
            onKeyDown: (event) => this.onKeyDown(event),
          });
        }),
      };

      const Async = defineAsyncComponent(() => Promise.resolve(Inner));

      const app = mountComponent({
        data: () => ({ tick: 0 }),
        render: renderReactCompat(function (h) {
          return h(Async, { key: `v${this.tick}`, onKeyDown });
        }),
      });

      await nextTick();
      // Once the definition has loaded, the parent renders the override again —
      // the way a chat does while a turn streams in.
      await app.setData({ tick: 1 });
      await nextTick();

      document
        .getElementById('async-input')
        .dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));

      expect(onKeyDown).toHaveBeenCalledTimes(1);
    });
  });
});

describeOnVue3('with a mixin registered on the app', () => {
  it('counts the prop that mixin declares once', () => {
    const onKeyDown = jest.fn();

    const Child = {
      // Declares nothing of its own: Vue merges the app-level mixin into every
      // component, which no definition object shows.
      render: renderReactCompat(function (h) {
        return h('input', {
          id: 'mixin-input',
          onKeyDown: (event) => this.onKeyDown(event),
        });
      }),
    };

    const host = document.createElement('div');
    document.body.appendChild(host);

    const app = createApp({
      render: renderReactCompat(function (h) {
        return h(Child, { onKeyDown });
      }),
    });
    app.mixin({ props: { onKeyDown: { type: Function, default: undefined } } });
    app.mount(host);

    host
      .querySelector('#mixin-input')
      .dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));

    app.unmount();
    host.remove();

    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });
});
