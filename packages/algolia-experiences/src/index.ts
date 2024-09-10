import { setupInstantSearch } from './setup-instantsearch';

if (typeof window === 'object') {
  document.addEventListener('DOMContentLoaded', setupInstantSearch);
}
