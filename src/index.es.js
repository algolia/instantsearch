import algoliasearchHelper from 'algoliasearch-helper';
import toFactory from 'to-factory';
import InstantSearch from './lib/InstantSearch';

const instantSearchFactory = toFactory(InstantSearch);

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

const createQueryString = algoliasearchHelper.url.getQueryStringFromState;

export { default as version } from './lib/version';
export { createQueryString };
// export { default as routers } from './lib/routers';
// export { default as stateMapping } from './lib/stateMapping';
export * from './helpers';
export * from './connectors';
export * from './widgets';
export default instantSearchFactory;
