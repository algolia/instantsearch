import { stats as fn } from 'instantsearch.js/es/widgets';

import { defineWidget } from '../types';

// stats takes no options beyond `templates`/`cssClasses`, so this shows the
// bare `stats()` call — the zero-option case.
export const stats = defineWidget({
  name: 'stats',
  fn,
  slot: 'meta',
  defaults: [],
  toggles: [],
});
