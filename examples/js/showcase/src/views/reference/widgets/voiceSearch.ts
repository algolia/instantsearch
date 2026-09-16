import { voiceSearch as fn } from 'instantsearch.js/es/widgets';

import { defineWidget } from '../types';

export const voiceSearch = defineWidget({
  name: 'voiceSearch',
  fn,
  flavors: ['js', 'vue'],
  slot: 'search',
  replaces: [],
  defaults: [],
  // `createVoiceSearchHelper` is omitted: replacing it means supplying a whole
  // speech-recognition implementation, not setting a value.
  toggles: [
    {
      key: 'searchAsYouSpeak',
      label: 'true',
      value: { searchAsYouSpeak: true },
    },
    {
      key: 'language',
      label: "'en-GB'",
      value: { language: 'en-GB' },
    },
    {
      key: 'additionalQueryParameters',
      label: "() => ({ queryLanguages: ['en'] })",
      value: { additionalQueryParameters: () => ({ queryLanguages: ['en'] }) },
    },
  ],
});
