import search from './search';
import { attachEventListeners } from './ui';

search.start();
attachEventListeners();

declare global {
  interface Window {
    search: typeof search;
  }
}

window.search = search;
