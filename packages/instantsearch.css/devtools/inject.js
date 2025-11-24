// @ts-check

/**
 * Auto-inject devtools for InstantSearch CSS variables.
 */

import { createInstantSearchDevtools } from './index.js';

const GLOBAL_KEY = '__INSTANTSEARCH_DEVTOOLS_INITIALIZED__';

if (
  typeof window !== 'undefined' &&
  typeof document !== 'undefined' &&
  !window[GLOBAL_KEY]
) {
  window[GLOBAL_KEY] = true;
  createInstantSearchDevtools().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Failed to initialize InstantSearch devtools:', err);
  });
}
