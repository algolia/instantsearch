import Vue from 'vue';

const isVue2 = true;
const isVue3 = false;
const Vue2 = Vue;
const version = Vue.version;

export { Vue, Vue2, isVue2, isVue3, version };

const augmentCreateElement =
  (createElement) =>
  (tag, propsWithClassName = {}, ...children) => {
    const { className, ...props } = propsWithClassName;

    if (typeof tag === 'function') {
      return tag(
        Object.assign(props, {
          class: className || props.class,
          children: children.length > 0 ? children : undefined,
        })
      );
    }

    if (typeof tag === 'string') {
      const { on, style, attrs, domProps, nativeOn, key, ...rest } = props;
      return createElement(
        tag,
        {
          class: className || props.class,
          attrs: attrs || rest,
          on,
          nativeOn,
          style,
          domProps,
          key,
        },
        children
      );
    }

    return createElement(
      tag,
      Object.assign(props, { class: className || props.class }),
      children
    );
  };

export function renderCompat(fn) {
  return function (createElement) {
    return fn.call(this, augmentCreateElement(createElement));
  };
}

/**
 * A Fragment for the React-style renderer: a plain function component that
 * returns its children. Vue 2 has no native Fragment, but shared
 * `instantsearch-ui-components` factories only use it to group children.
 */
export const Fragment = (props) => (props && props.children) || [];

/**
 * A `createElement` that understands the React-style markup emitted by
 * `instantsearch-ui-components` factories (`className`, `onClick`/`onKeyDown`
 * handlers, and `ref` as a MutableRef `{ current }`), mapping them onto Vue 2's
 * `h`. This is what lets Vue consume shared, hook-driven components (Carousel,
 * Autocomplete, …) rather than reimplementing their markup.
 */
export function augmentReactCreateElement(createElement) {
  return function reactCreateElement(tag, rawProps, ...rest) {
    const props = rawProps || {};
    const children = flattenChildren(rest);
    const childArg = children.length > 0 ? children : undefined;

    // Plain function components (shared sub-factories, Fragment) render eagerly.
    if (typeof tag === 'function') {
      return tag(
        Object.assign({}, props, {
          class: props.className || props.class,
          children: childArg,
        })
      );
    }

    const data = { attrs: {}, on: {} };

    Object.keys(props).forEach((name) => {
      const value = props[name];

      if (name === 'className') {
        data.class = value;
      } else if (name === 'class') {
        data.class = data.class || value;
      } else if (name === 'style') {
        data.style = value;
      } else if (name === 'key') {
        data.key = value;
      } else if (name === 'children') {
        // handled via the children argument
      } else if (name === 'ref') {
        bindMutableRef(data, value);
      } else if (isEventProp(name, value)) {
        // onKeyDown -> keydown, onClick -> click, onFocus -> focus
        data.on[name.slice(2).toLowerCase()] = value;
      } else if (typeof value === 'boolean' && name.indexOf('aria-') === 0) {
        // React renders `aria-expanded={false}` as "false"; Vue 2 drops falsy
        // boolean attrs, so stringify to preserve the accessibility contract.
        data.attrs[name] = String(value);
      } else {
        data.attrs[name] = value;
      }
    });

    return createElement(tag, data, childArg);
  };
}

/**
 * Wraps a render function so it receives a React-style `createElement`, the way
 * `renderCompat` provides the Vue-style one.
 */
export function renderReactCompat(fn) {
  return function (createElement) {
    return fn.call(this, augmentReactCreateElement(createElement));
  };
}

function isEventProp(name, value) {
  return (
    typeof value === 'function' && name.length > 2 && /^on[A-Z]/.test(name)
  );
}

function bindMutableRef(data, ref) {
  if (!ref || typeof ref !== 'object' || !('current' in ref)) {
    return;
  }

  // Vue 2 has no function refs, so populate the MutableRef via vnode lifecycle
  // hooks. `vnode.elm` is the underlying DOM node.
  data.hook = data.hook || {};
  const previousInsert = data.hook.insert;
  const previousDestroy = data.hook.destroy;

  data.hook.insert = (vnode) => {
    ref.current = vnode.elm;
    if (previousInsert) previousInsert(vnode);
  };
  data.hook.destroy = (vnode) => {
    ref.current = null;
    if (previousDestroy) previousDestroy(vnode);
  };
}

function flattenChildren(nodes) {
  return nodes.reduce((acc, node) => {
    if (Array.isArray(node)) {
      return acc.concat(flattenChildren(node));
    }
    if (node !== undefined && node !== null && node !== false) {
      acc.push(node);
    }
    return acc;
  }, []);
}

export function getDefaultSlot(component) {
  return component.$slots.default;
}

export function getScopedSlot(component, name) {
  return (component.$scopedSlots || {})[name];
}

// Vue3-only APIs
export const computed = undefined;
export const createApp = undefined;
export const createSSRApp = undefined;
export const createRef = undefined;
export const customRef = undefined;
export const defineAsyncComponent = undefined;
export const defineComponent = undefined;
export const del = undefined;
export const getCurrentInstance = undefined;
export const h = undefined;
export const inject = undefined;
export const isRaw = undefined;
export const isReactive = undefined;
export const isReadonly = undefined;
export const isRef = undefined;
export const markRaw = undefined;
export const nextTick = undefined;
export const onActivated = undefined;
export const onBeforeMount = undefined;
export const onBeforeUnmount = undefined;
export const onBeforeUpdate = undefined;
export const onDeactivated = undefined;
export const onErrorCaptured = undefined;
export const onMounted = undefined;
export const onServerPrefetch = undefined;
export const onUnmounted = undefined;
export const onUpdated = undefined;
export const provide = undefined;
export const proxyRefs = undefined;
export const reactive = undefined;
export const readonly = undefined;
export const ref = undefined;
export const set = undefined;
export const shallowReactive = undefined;
export const shallowReadonly = undefined;
export const shallowRef = undefined;
export const toRaw = undefined;
export const toRef = undefined;
export const toRefs = undefined;
export const triggerRef = undefined;
export const unref = undefined;
export const useCSSModule = undefined;
export const useCssModule = undefined;
export const warn = undefined;
export const watch = undefined;
export const watchEffect = undefined;
