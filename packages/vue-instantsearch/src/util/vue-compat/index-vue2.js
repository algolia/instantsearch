import Vue from 'vue';

const isVue2 = true;
const isVue3 = false;
const Vue2 = Vue;
const version = Vue.version;

export { Vue, Vue2, isVue2, isVue3, version };

const augmentCreateElement =
  (createElement) =>
  (tag, propsWithClassName, ...children) => {
    const { className, ...props } = propsWithClassName || {};

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
      // React-style `onClick` / `onAuxClick` props (e.g. from shared
      // `instantsearch-ui-components` JSX) need to be remapped to Vue 2's
      // `on: { click, auxclick }` event API so they don't fall through to
      // `attrs` and end up rendered as literal HTML attributes.
      const reactStyleHandlers = {};
      const remainingAttrs = {};
      Object.keys(rest).forEach((prop) => {
        if (
          prop.length > 2 &&
          prop[0] === 'o' &&
          prop[1] === 'n' &&
          prop[2] === prop[2].toUpperCase() &&
          typeof rest[prop] === 'function'
        ) {
          reactStyleHandlers[prop.slice(2).toLowerCase()] = rest[prop];
        } else {
          remainingAttrs[prop] = rest[prop];
        }
      });
      return createElement(
        tag,
        {
          class: className || props.class,
          attrs: attrs || remainingAttrs,
          on: Object.keys(reactStyleHandlers).length
            ? Object.assign({}, reactStyleHandlers, on)
            : on,
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
 * Fragment shim for the augmented JSX renderer used by `renderCompat`.
 * Functional pragmas in `instantsearch-ui-components` use
 * `<Fragment>{children}</Fragment>` to skip wrapping markup; Vue 2 has no
 * native fragment, so we return the children array directly and let Vue 2
 * flatten it into the surrounding vnode.
 */
export const Fragment = function Fragment(props) {
  return props && props.children !== undefined ? props.children : null;
};

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
