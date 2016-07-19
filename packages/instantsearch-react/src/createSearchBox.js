import React, {PropTypes, Component} from 'react';
import {connect} from 'react-algoliasearch-helper';

export default function createSearchBox(Composed) {
  class SearchBoxWrapper extends Component {
    static propTypes = {
      helper: PropTypes.object.isRequired,
    };

    refine = query => {
      this.props.helper.setQuery(query).search();
    }

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
    query: state.searchParameters.query,
  }))(SearchBoxWrapper);
}
