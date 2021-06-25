import { isVue3 } from 'vue-demi';

export const mount = isVue3
  ? (component, options = {}) => {
      const { propsData, mixins, provide, ...restOptions } = options;
      // If we `import` this, it will try to import Vue3-only APIs like `defineComponent`,
      // and jest will fail. So we need to `require` it.
      const wrapper = require('@vue/test-utils2').mount(component, {
        ...restOptions,
        props: propsData,
        global: {
          mixins,
          provide,
        },
      });
      wrapper.destroy = wrapper.unmount;
      return wrapper;
    }
  : require('@vue/test-utils').mount;
