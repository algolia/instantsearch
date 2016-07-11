import connect from 'algoliasearch-helper-provider/src/connect';

export default connect(state => ({
  hits: state.searchResults && state.searchResults.hits,
}));
