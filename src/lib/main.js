// required for browsers not supporting Object.freeze (helper requirement)
import '../shams/Object.freeze.js';

// required for IE <= 10 since move to babel6
import '../shims/Object.getPrototypeOf.js';

import toFactory from 'to-factory';
import algoliasearchHelper from 'algoliasearch-helper';

import InstantSearch from './InstantSearch.js';
import version from './version.js';

import * as connectors from '../connectors/index.js';
import * as widgets from '../widgets/index.js';

const instantsearch = Object.assign(toFactory(InstantSearch), {
  createQueryString: algoliasearchHelper.url.getQueryStringFromState,
  connectors,
  widgets,
  version,
});

export default instantsearch;
