import { InstantSearchOptions } from './types';
import InstantSearch from './lib/InstantSearch';
import version from './lib/version';
import { snippet, highlight, insights } from './helpers';

const instantsearch = (options: InstantSearchOptions): InstantSearch =>
  new InstantSearch(options);

instantsearch.version = version;
instantsearch.snippet = snippet;
instantsearch.highlight = highlight;
instantsearch.insights = insights;

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
