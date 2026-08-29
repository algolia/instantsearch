import { connectSearchBox } from 'instantsearch.js/es/connectors/index';

import { computed } from '../util/vue-compat';

import { useConnector } from './useConnector';

export function useSearchBox(widgetParams = {}) {
  const state = useConnector(connectSearchBox, widgetParams, {
    $$widgetType: 'ais.searchBox',
  });

  // Public surface per the Vue composables convention: a plain object of
  // refs (destructurable), with stable function wrappers delegating to the
  // latest render state so consumers never call `.value`.
  return {
    query: computed(() => state.value.query),
    isSearchStalled: computed(() => state.value.isSearchStalled),
    refine: (value) => state.value.refine(value),
    clear: () => state.value.clear(),
  };
}
