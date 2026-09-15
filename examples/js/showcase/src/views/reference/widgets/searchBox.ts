import { searchBox as fn } from 'instantsearch.js/es/widgets';

import { defineWidget } from '../types';

let debounceTimer: ReturnType<typeof setTimeout>;

function debouncedQueryHook(query: string, refine: (value: string) => void) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => refine(query), 400);
}

export const searchBox = defineWidget({
  name: 'searchBox',
  fn,
  slot: 'search',
  defaults: [],
  toggles: [
    {
      key: 'placeholder',
      label: "'Search products…'",
      value: { placeholder: 'Search products…' },
    },
    {
      key: 'autofocus',
      label: 'true',
      value: { autofocus: true },
    },
    {
      key: 'searchAsYouType',
      label: 'false',
      value: { searchAsYouType: false },
    },
    {
      key: 'showSubmit',
      label: 'false',
      value: { showSubmit: false },
    },
    {
      key: 'showReset',
      label: 'false',
      value: { showReset: false },
    },
    {
      key: 'showLoadingIndicator',
      label: 'false',
      value: { showLoadingIndicator: false },
    },
    {
      key: 'submitTitle',
      label: "'Go'",
      value: { submitTitle: 'Go' },
    },
    {
      key: 'resetTitle',
      label: "'Clear'",
      value: { resetTitle: 'Clear' },
    },
    {
      key: 'ignoreCompositionEvents',
      label: 'true',
      value: { ignoreCompositionEvents: true },
    },
    {
      key: 'queryHook',
      label: 'debouncedQueryHook',
      value: { queryHook: debouncedQueryHook },
    },
  ],
  // `aiMode` is omitted: it needs a Chat widget on the same index.
});
