import React, {Component} from 'react';
import qs from 'qs';

export const withUrlSync = App => class extends Component {
  constructor() {
    super();
    this.state = {searchState: qs.parse(window.location.search.slice(1))};
    window.onpopstate = () => this.setState({searchState: qs.parse(window.location.search.slice(1))});
  }

  onStateChange = nextState => {
    const THRESHOLD = 700;
    const newPush = Date.now();
    const search = nextState ? `?${qs.stringify(nextState)}` : '';
    if (this.state.lastPush && newPush - this.state.lastPush <= THRESHOLD) {
      window.history.replaceState(null, null, search);
    } else {
      window.history.pushState(null, null, search);
    }
    this.setState({lastPush: newPush, searchState: nextState});
  };

  createURL = state => `?${qs.stringify(state)}`;

  render() {
    return <App {...this.props}
                state={this.state.searchState}
                onStateChange={this.onStateChange}
                createURL={this.createURL}/>;
  }
};
