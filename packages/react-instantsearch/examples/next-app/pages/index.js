import { Head, App, findResultsState } from '../components';
import React from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';
import qs from 'qs';

const searchStateToUrl = searchState =>
  searchState ? `${window.location.pathname}?${qs.stringify(searchState)}` : '';

export default class extends React.Component {
  static propTypes = {
    resultsState: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.onSearchStateChange = this.onSearchStateChange.bind(this);
    this.state = { searchState: {} };
  }

  static async getInitialProps(params) {
    const searchState = qs.parse(params.asPath.substring(2)); //nextjs params.query doesn't handle nested objects
    const resultsState = await findResultsState(App, { searchState });
    return { resultsState };
  }

  onSearchStateChange(searchState) {
    const href = searchStateToUrl(searchState);
    Router.push(href, href, {
      shallow: true,
    });
  }

  componentDidMount() {
    this.setState({ searchState: qs.parse(window.location.search.slice(1)) });
  }

  componentWillReceiveProps() {
    this.setState({ searchState: qs.parse(window.location.search.slice(1)) });
  }

  render() {
    return (
      <div>
        <Head title="Home" />
        <div>
          <App
            resultsState={this.props.resultsState}
            onSearchStateChange={this.onSearchStateChange}
            searchState={this.state.searchState}
          />
        </div>
      </div>
    );
  }
}
