/* eslint max-len: 0 */
import algoliasearchHelper from 'algoliasearch-helper';
import toFactory from 'to-factory';

import InstantSearch from './src/lib/InstantSearch.js';
import version from './src/lib/version.js';

// import instantsearch from 'instantsearch.js';
// -> provides instantsearch object without connectors and widgets
export default Object.assign(toFactory(InstantSearch), {
  version,
  createQueryString: algoliasearchHelper.url.getQueryStringFromState,

  get widgets() {
    throw new Error(`
      You can't access to 'instantsearch.widgets' directly from the ES6 build.
      Import the widgets this way 'import {SearchBox} from "instantsearch.js"'
    `);
  },

  get connectors() {
    throw new Error(`
      You can't access to 'instantsearch.connectors' directly from the ES6 build.
      Import the connectors this way 'import {connectSearchBox} from "instantsearch.js"'
    `);
  },
});
