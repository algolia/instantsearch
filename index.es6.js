/* eslint max-len: 0 */
import algoliasearchHelper from 'algoliasearch-helper';
import toFactory from 'to-factory';

/* eslint-disable */
import InstantSearch from './lib/InstantSearch';
import version from './lib/version';
/* eslint-enable */

// import instantsearch from 'instantsearch';
// -> provides instantsearch object without connectors and widgets
const instantSearchFactory = toFactory(InstantSearch);

instantSearchFactory.version = version;
instantSearchFactory.createQueryString =
  algoliasearchHelper.url.getQueryStringFromState;

Object.defineProperty(instantSearchFactory, 'widgets', {
  get() {
    throw new ReferenceError(
      `You can't access 'instantsearch.widgets' directly from the ES6 build.
Import the widgets this way: 'import {searchBox} from "instantsearch.js/es/widgets"'`
    );
  },
});

Object.defineProperty(instantSearchFactory, 'connectors', {
  get() {
    throw new ReferenceError(
      `You can't access 'instantsearch.connectors' directly from the ES6 build.
Import the connectors this way: 'import {connectSearchBox} from "instantsearch.js/es/connectors"'`
    );
  },
});

export default instantSearchFactory;
