import React, {Component} from 'react';
import qs from 'qs';

export const withUrlSync = App => class extends Component {
  constructor() {
    super();
    this.state = {searchState: qs.parse(window.location.search.slice(1))};
    window.onpopstate = () => this.setState({searchState: qs.parse(window.location.search.slice(1))});
  }

  onSearchStateChange = nextSearchState => {
    const THRESHOLD = 700;
    const newPush = Date.now();
    const search = nextSearchState ? `${window.location.pathname}?${qs.stringify(nextSearchState)}` : '';
    if (this.state.lastPush && newPush - this.state.lastPush <= THRESHOLD) {
      window.history.replaceState(null, null, search);
    } else {
      window.history.pushState(null, null, search);
    }
    this.setState({lastPush: newPush, searchState: nextSearchState});
  };

  createURL = searchState => `${window.location.pathname}?${qs.stringify(searchState)}`;

  render() {
    return <App {...this.props}
                searchState={this.state.searchState}
                onSearchStateChange={this.onSearchStateChange}
                createURL={this.createURL}
    />;
  }
};
