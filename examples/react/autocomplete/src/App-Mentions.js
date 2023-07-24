import algoliasearch from 'algoliasearch/lite';
import Mention from 'antd/lib/mention';
import PropTypes from 'prop-types';
import React from 'react';
import { InstantSearch, connectAutoComplete } from 'react-instantsearch-dom';
import 'antd/lib/mention/style/css';

const AsyncMention = ({ hits, refine }) => (
  <Mention
    style={{ width: 500, height: 100 }}
    prefix="@"
    notFoundContent={'No suggestion'}
    placeholder="give someone an @-mention here"
    suggestions={hits.map((hit) => hit.name)}
    onSearchChange={(query) => refine(query)}
  />
);

AsyncMention.propTypes = {
  hits: PropTypes.array,
  refine: PropTypes.func,
};

const ConnectedAsyncMention = connectAutoComplete(AsyncMention);

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const App = () => (
  <InstantSearch searchClient={searchClient} indexName="actors">
    <ConnectedAsyncMention />
  </InstantSearch>
);

export default App;
