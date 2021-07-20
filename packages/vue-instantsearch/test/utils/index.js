import {
  isVue3,
  h,
  createApp as _createApp,
  createSSRApp as _createSSRApp,
  nextTick as _nextTick,
  Vue2,
} from '../../src/util/vue-compat';

export const mount = isVue3
  ? (component, options = {}) => {
      const {
        propsData,
        mixins,
        provide,
        slots,
        scopedSlots,
        ...restOptions
      } = options;
      // If we `import` this, it will try to import Vue3-only APIs like `defineComponent`,
      // and jest will fail. So we need to `require` it.
      const wrapper = require('@vue/test-utils2').mount(component, {
        ...restOptions,
        props: propsData,
        global: {
          mixins,
          provide,
        },
        slots: {
          ...slots,
          ...scopedSlots,
        },
      });
      wrapper.destroy = wrapper.unmount;
      return wrapper;
    }
  : require('@vue/test-utils').mount;

export const createApp = props => {
  if (isVue3) {
    return _createApp(props);
  } else {
    return new Vue2(props);
  }
};

export const createSSRApp = props => {
  if (isVue3) {
    return _createSSRApp(props);
  } else {
    return new Vue2(props);
  }
};

export function renderCompat(fn) {
  return function(createElementV2) {
    return isVue3 ? fn.call(this, h) : fn.call(this, createElementV2);
  };
}

export const nextTick = () => (isVue3 ? _nextTick() : Vue2.nextTick());
