import InstantSearch from './instantsearch';

// Automatically register Algolia Search components if Vue is available globally
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(InstantSearch);
}

export * from './instantsearch';
