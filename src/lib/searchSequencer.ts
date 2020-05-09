import algoliasearchHelper from 'algoliasearch-helper';
import { SearchClient } from '../types';

type SearchSequencerProps = {
  searchClient: SearchClient;
  indexName: string;
  onError(params: { error: Error }): void;
};

/**
 * Create a search sequencer that dispatches queries to all its search indices.
 *
 * It uses derived helpers for each search index responsible for their state.
 */
export function createSearchSequencer({
  searchClient,
  indexName,
  onError,
}: SearchSequencerProps) {
  const helper = algoliasearchHelper(searchClient, indexName);

  // Redirecting the helper `search` methods to its derived helpers allows us
  // to keep the exact same API for users.
  // The search sequencer doesn't trigger searches itself, but forwards them
  // to all the indices using derived helpers.
  helper.search = () => helper.searchOnlyWithDerivedHelpers();

  helper.on('error', onError);

  return {
    dispatchSearch() {
      return helper.search();
    },
    hasPendingRequests() {
      return helper.hasPendingRequests();
    },
    clearCache() {
      return helper.clearCache();
    },
    getLegacyHelper() {
      return helper;
    },
    teardown() {
      helper.removeAllListeners();
    },
  };
}
