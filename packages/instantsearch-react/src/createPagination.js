import React, {PropTypes, Component} from 'react';
import connect from 'algoliasearch-helper-provider/src/connect';

export default function createPagination(Composed) {
  class PaginationWrapper extends Component {
    static propTypes = {
      helper: PropTypes.object.isRequired,
    };

    refine = pageNumber => {
      this.props.helper.setCurrentPage(pageNumber).search();
    };

    render() {
      return (
        <Composed
          refine={this.refine}
          {...this.props}
        />
      );
    }
  }

  return connect(state => ({
    nbPages: state.searchResults && state.searchResults.nbPages,
    nbHits: state.searchResults && state.searchResults.nbHits,
    page: state.searchResults && state.searchResults.page,
  }))(PaginationWrapper);
}
