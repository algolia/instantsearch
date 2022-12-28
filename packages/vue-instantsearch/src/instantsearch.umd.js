import { plugin } from './plugin';
import { isVue2 } from './util/vue-compat';

// Automatically register Algolia Search components if Vue 2.x is available globally.
if (typeof window !== 'undefined' && window.Vue && isVue2) {
  window.Vue.use(plugin);
}

export { createSuitMixin } from './mixins/suit';
export { createWidgetMixin } from './mixins/widget';
export * from './widgets';
