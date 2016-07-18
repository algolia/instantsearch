import React, {PropTypes, Component} from 'react';
import {connect} from 'react-algoliasearch-helper';

export default function createHitsPerPage(Composed) {
  class HitsPerPageWrapper extends Component {
    static propTypes = {
      helper: PropTypes.object.isRequired,
    };

    refine = hitsPerPage => {
      this.props.helper.setState(
        this.props.helper.getState().setHitsPerPage(hitsPerPage)
      ).search();
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
    hitsPerPage: state.searchParameters.hitsPerPage,
  }))(HitsPerPageWrapper);
}
