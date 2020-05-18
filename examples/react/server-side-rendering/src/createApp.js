import algoliasearch from 'algoliasearch/lite';

import App from './App';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

export const createApp = () => {
  const indexName = 'instant_search';
  const props = {
    indexName,
    searchClient,
  };

  return {
    App,
    props,
  };
};

export default App;
