import React from 'react';
import PropTypes from 'prop-types';
import Mention from 'antd/lib/mention';
import 'antd/lib/mention/style/css';
import { InstantSearch } from 'react-instantsearch/dom';
import { connectAutoComplete } from 'react-instantsearch/connectors';

const AsyncMention = ({ hits, refine }) => (
  <Mention
    style={{ width: 500, height: 100 }}
    prefix="@"
    notFoundContent={'No suggestion'}
    placeholder="give someone an @-mention here"
    suggestions={hits.map(hit => hit.name)}
    onSearchChange={query => refine(query)}
  />
);

AsyncMention.propTypes = {
  hits: PropTypes.array,
  refine: PropTypes.func,
};

const ConnectedAsyncMention = connectAutoComplete(AsyncMention);

const App = () => (
  <InstantSearch
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="actors"
  >
    <ConnectedAsyncMention />
  </InstantSearch>
);

export default App;
