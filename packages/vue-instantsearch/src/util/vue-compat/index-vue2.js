import Vue from 'vue';

const isVue2 = true;
const isVue3 = false;
const Vue2 = Vue;
const version = Vue.version;

export { Vue, Vue2, isVue2, isVue3, version };

export function renderCompat(fn) {
  return function (createElement) {
    return fn.call(this, createElement);
  };
}

export function getDefaultSlot(component) {
  return component.$slots.default;
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
