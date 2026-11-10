import search from './search';
import { attachEventListeners } from './ui';

import 'instantsearch.css/themes/reset.css';

search.start();
attachEventListeners();

declare global {
  interface Window {
    search: typeof search;
  }
}

window.search = search;
