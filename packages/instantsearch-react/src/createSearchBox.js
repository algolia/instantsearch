import React, {PropTypes, Component} from 'react';
import connect from 'algoliasearch-helper-provider/src/connect';

export default function createSearchBox(Composed) {
  class SearchBoxWrapper extends Component {
    static propTypes = {
      helper: PropTypes.object.isRequired,
    };

    constructor(props) {
      super();

      this.setQuery = props.helper.setQuery.bind(props.helper);
      this.search = props.helper.search.bind(props.helper);
    }

    render() {
      return (
        <Composed
          setQuery={this.setQuery}
          search={this.search}
          {...this.props}
        />
      );
    }
  }

  return connect(state => ({
    query: state.searchParameters.query,
  }))(SearchBoxWrapper);
}
