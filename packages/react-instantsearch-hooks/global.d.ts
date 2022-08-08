declare const __DEV__: boolean;

import 'instantsearch.js';
declare module 'instantsearch.js' {
  declare class InstantSearch {
    _preventWidgetCleanup?: boolean;
  }
}
