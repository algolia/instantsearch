import React, {PropTypes, Component} from 'react';
import {connect} from 'react-algoliasearch-helper';

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
    page: state.searchParameters.page,
  }))(PaginationWrapper);
}
