import { plugin } from './plugin';

// Automatically register Algolia Search components if Vue is available globally
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(plugin);
}

export * from './instantsearch';
