import algoliasearchHelper from 'algoliasearch-helper';
import toFactory from 'to-factory';
import InstantSearch from './lib/InstantSearch';
import version from './lib/version';

const instantSearchFactory = toFactory(InstantSearch);
instantSearchFactory.version = version;
instantSearchFactory.createQueryString =
  algoliasearchHelper.url.getQueryStringFromState;

Object.defineProperty(instantSearchFactory, 'widgets', {
  get() {
    throw new ReferenceError(
      `"instantsearch.widgets" are not available from the ES build.

To import the widgets:

import { searchBox } from 'instantsearch.js'`
    );
  },
});
Object.defineProperty(instantSearchFactory, 'connectors', {
  get() {
    throw new ReferenceError(
      `"instantsearch.connectors" are not available from the ES build.

To import the connectors:

import { connectSearchBox } from 'instantsearch.js'`
    );
  },
});

export * from './helpers';
export * from './connectors';
export * from './widgets';
export default instantSearchFactory;
