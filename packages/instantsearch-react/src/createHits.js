import {connect} from 'react-algoliasearch-helper';

export default connect(state => ({
  hits: state.searchResults && state.searchResults.hits,
}));
