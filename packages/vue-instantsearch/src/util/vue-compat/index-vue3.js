import * as Vue from 'vue';

const isVue2 = false;
const isVue3 = true;
const Vue2 = undefined;

export { createApp, createSSRApp, h, version, nextTick } from 'vue';
export { Vue, Vue2, isVue2, isVue3 };

/**
 * A Fragment for the React-style renderer: a plain function component that
 * returns its children. Matches the Vue 2 implementation so shared markup
 * serializes identically across versions — the real Vue 3 `Fragment` symbol
 * introduces anchor/whitespace nodes that would break shared snapshots.
 */
export const Fragment = (props) => (props && props.children) || [];

export function renderCompat(fn) {
  function h(tag, props, ...childrenArray) {
    const children = childrenArray.length > 0 ? childrenArray : undefined;
    if (
      typeof props === 'object' &&
      (props.attrs || props.props || props.scopedSlots || props.on)
    ) {
      // In vue 3, we no longer wrap with `attrs` or `props` key.
      const onPropKeys = Object.keys(props.on || {});
      const flatProps = Object.assign(
        {},
        props,
        props.attrs,
        props.props,
        onPropKeys.reduce((acc, key) => {
          // eslint-disable-next-line no-param-reassign
          acc[`on${key[0].toUpperCase()}${key.slice(1)}`] = props.on[key];
          return acc;
        }, {})
      );
      delete flatProps.attrs;
      delete flatProps.props;
      delete flatProps.scopedSlots;
      onPropKeys.forEach((key) => delete flatProps.on[key]);
      if (flatProps.on && Object.keys(flatProps.on).length === 0) {
        delete flatProps.on;
      }

      return Vue.h(
        tag,
        flatProps,
        props.scopedSlots
          ? Object.assign({ default: () => children }, props.scopedSlots)
          : children
      );
    }

    return Vue.h(tag, props, children);
  }

  return function () {
    return fn.call(this, h);
  };
}

/**
 * A `createElement` that understands the React-style markup emitted by
 * `instantsearch-ui-components` factories (`className`, `onClick`/`onKeyDown`
 * handlers, and `ref` as a MutableRef `{ current }`), mapping them onto Vue 3's
 * `h`. Mirrors the Vue 2 implementation in `index-vue2.js`.
 */
export function augmentReactCreateElement(baseH) {
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

    const data = {};

    Object.keys(props).forEach((name) => {
      const value = props[name];

      if (name === 'className') {
        data.class = value;
      } else if (name === 'children') {
        // handled via the children argument
      } else if (name === 'ref') {
        const functionRef = makeFunctionRef(value);
        if (functionRef) {
          data.ref = functionRef;
        }
      } else if (isEventProp(name, value)) {
        // React `onKeyDown` -> Vue 3 `onKeydown` (compiler-style handler key)
        const eventName = name.slice(2).toLowerCase();
        data[`on${eventName[0].toUpperCase()}${eventName.slice(1)}`] = value;
      } else if (typeof value === 'boolean' && name.indexOf('aria-') === 0) {
        data[name] = String(value);
      } else {
        data[name] = value;
      }
    });

    return baseH(tag, data, childArg);
  };
}

export function renderReactCompat(fn) {
  return function () {
    return fn.call(this, augmentReactCreateElement(Vue.h));
  };
}

function isEventProp(name, value) {
  if (typeof value !== 'function' || name.length < 3) {
    return false;
  }
  // Matches `on` followed by an uppercase letter (e.g. onClick, onKeyDown)
  // without a regex, to keep static analysers happy.
  const thirdCharCode = name.charCodeAt(2);
  return (
    name[0] === 'o' &&
    name[1] === 'n' &&
    thirdCharCode >= 65 &&
    thirdCharCode <= 90
  );
}

function makeFunctionRef(ref) {
  if (!ref || typeof ref !== 'object' || !('current' in ref)) {
    return undefined;
  }
  return (element) => {
    ref.current = element;
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
  const $slots = component.$slots || component.slots;

  if (typeof $slots.default === 'function') {
    // Vue 3
    return $slots.default();
  }

  // Vue 3 with @vue/compat
  return $slots.default;
}

export function getScopedSlot(component, name) {
  return (component.$slots || component.slots || {})[name];
}
