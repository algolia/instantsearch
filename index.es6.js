/* eslint max-len: 0 */
import toFactory from 'to-factory';

/* eslint-disable import/no-unresolved */
import InstantSearch from './lib/InstantSearch.js';
import version from './lib/version.js';
import { snippet, highlight } from './helpers';
/* eslint-enable import/no-unresolved */

// import instantsearch from 'instantsearch.js';
// -> provides instantsearch object without connectors and widgets
const instantSearchFactory = toFactory(InstantSearch);

instantSearchFactory.version = version;
instantSearchFactory.snippet = snippet;
instantSearchFactory.highlight = highlight;

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
