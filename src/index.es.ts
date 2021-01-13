import { InstantSearchOptions } from './types';
import InstantSearch from './lib/InstantSearch';
import version from './lib/version';
import {
  snippet,
  reverseSnippet,
  highlight,
  reverseHighlight,
  insights,
  getInsightsAnonymousUserToken,
} from './helpers';
import { createInfiniteHitsSessionStorageCache } from './lib/infiniteHitsCache';

const instantsearch = (options: InstantSearchOptions): InstantSearch =>
  new InstantSearch(options);

instantsearch.version = version;
instantsearch.snippet = snippet;
instantsearch.reverseSnippet = reverseSnippet;
instantsearch.highlight = highlight;
instantsearch.reverseHighlight = reverseHighlight;
instantsearch.insights = insights;
instantsearch.getInsightsAnonymousUserToken = getInsightsAnonymousUserToken;
instantsearch.createInfiniteHitsSessionStorageCache = createInfiniteHitsSessionStorageCache;

Object.defineProperty(instantsearch, 'widgets', {
  get() {
    throw new ReferenceError(
      `"instantsearch.widgets" are not available from the ES build.

To import the widgets:

import { searchBox } from 'instantsearch.js/es/widgets'`
    );
  },
});

Object.defineProperty(instantsearch, 'connectors', {
  get() {
    throw new ReferenceError(
      `"instantsearch.connectors" are not available from the ES build.

To import the connectors:

import { connectSearchBox } from 'instantsearch.js/es/connectors'`
    );
  },
});

export default instantsearch;
