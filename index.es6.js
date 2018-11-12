import algoliasearchHelper from 'algoliasearch-helper';
import toFactory from 'to-factory';

// This file gets moved to the `src/` folder before being compiled with Babel,
// hence the base path is `src/`.
/* eslint-disable import/no-unresolved */

import InstantSearch from './lib/InstantSearch';
import version from './lib/version';

const instantSearchFactory = toFactory(InstantSearch);
instantSearchFactory.version = version;
instantSearchFactory.createQueryString =
  algoliasearchHelper.url.getQueryStringFromState;

export * from './helpers';
export * from './connectors';
export * from './widgets';
export default instantSearchFactory;
