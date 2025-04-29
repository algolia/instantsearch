import { setupInstantSearch } from './setup-instantsearch';

if (typeof window === 'object') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupInstantSearch);
  } else {
    setupInstantSearch();
  }
}
