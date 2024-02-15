import * as Vue from 'vue';

const isVue2 = false;
const isVue3 = true;
const Vue2 = undefined;

export { createApp, createSSRApp, h, version, nextTick } from 'vue';
export { Vue, Vue2, isVue2, isVue3 };

export function renderCompat(fn) {
  function h(tag, props, children) {
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

export function getDefaultSlot(component) {
  const $slots = component.$slots || component.slots;

  if (typeof $slots.default === 'function') {
    // Vue 3
    return $slots.default();
  }

  // Vue 3 with @vue/compat
  return $slots.default;
}
