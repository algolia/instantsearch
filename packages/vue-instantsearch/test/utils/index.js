import {
  isVue3,
  createApp as _createApp,
  createSSRApp as _createSSRApp,
  nextTick as _nextTick,
  Vue2,
} from '../../src/util/vue-compat';

export const htmlCompat = function (html) {
  if (isVue3) {
    return html
      .replace(/disabled=""/g, 'disabled="disabled"')
      .replace(/hidden=""/g, 'hidden="hidden"')
      .replace(/novalidate=""/g, 'novalidate="novalidate"')
      .replace(/required=""/g, 'required="required"');
  } else {
    return html;
  }
};

export const mount = isVue3
  ? (component, options = {}) => {
      const {
        propsData,
        mixins,
        provide,
        slots,
        scopedSlots,
        stubs,
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
          stubs,
        },
        slots: {
          ...slots,
          ...scopedSlots,
        },
      });
      wrapper.destroy = wrapper.unmount;
      wrapper.htmlCompat = function () {
        return htmlCompat(this.html());
      };
      return wrapper;
    }
  : (component, options = {}) => {
      const wrapper = require('@vue/test-utils').mount(component, options);
      wrapper.htmlCompat = function () {
        return htmlCompat(this.html());
      };
      return wrapper;
    };

export const createApp = (props) => {
  if (isVue3) {
    return _createApp(props);
  } else {
    return new Vue2(props);
  }
};

export const createSSRApp = (props) => {
  if (isVue3) {
    return _createSSRApp(props);
  } else {
    return new Vue2(props);
  }
};

export const mountApp = (props, container) => {
  if (isVue3) {
    return _createApp(props).mount(container);
  } else {
    return new Vue2(props).$mount(container);
  }
};

/**
 * `mountApp`, rethrowing the first error a component throws while mounting,
 * e.g. a connector rejecting its options: Vue 2 only logs those, so a shared
 * test couldn't assert them. The app is unmounted first, so the widgets that
 * did mount don't keep running into the next test.
 */
export const mountAppOrThrow = (props, container) => {
  let mounting = true;
  let mountError;
  const options = Object.assign({}, props, {
    errorCaptured(error) {
      if (!mounting) {
        return undefined;
      }
      mountError = mountError || error;
      return false;
    },
  });
  const app = isVue3 ? _createApp(options) : new Vue2(options);
  const vm = isVue3 ? app.mount(container) : app.$mount(container);
  mounting = false;

  if (mountError) {
    if (isVue3) {
      app.unmount();
    } else {
      vm.$destroy();
    }
    throw mountError;
  }
  return vm;
};

export const nextTick = () => (isVue3 ? _nextTick() : Vue2.nextTick());
