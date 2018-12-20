import toFactory from 'to-factory';
import InstantSearch from './lib/InstantSearch';
import version from './lib/version.js';
import { snippet, highlight } from './helpers';

const instantSearchFactory = toFactory(InstantSearch);

instantSearchFactory.version = version;
instantSearchFactory.snippet = snippet;
instantSearchFactory.highlight = highlight;

Object.defineProperty(instantSearchFactory, 'widgets', {
  get() {
    throw new ReferenceError(
      `"instantsearch.widgets" are not available from the ES build.

To import the widgets:

import { searchBox } from 'instantsearch.js/es/widgets'`
    );
  },
});

Object.defineProperty(instantSearchFactory, 'connectors', {
  get() {
    throw new ReferenceError(
      `"instantsearch.connectors" are not available from the ES build.

To import the connectors:

import { connectSearchBox } from 'instantsearch.js/es/connectors'`
    );
  },
});

export default instantSearchFactory;
