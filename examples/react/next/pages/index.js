import React from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';
import qs from 'qs';
import { Head, App, findResultsState } from '../components';

const updateAfter = 700;

const createURL = state => `?${qs.stringify(state)}`;

const searchStateToUrl = searchState =>
  searchState ? `${window.location.pathname}?${qs.stringify(searchState)}` : '';

export default class extends React.Component {
  static propTypes = {
    resultsState: PropTypes.object,
    searchState: PropTypes.object,
  };

  state = {
    searchState: this.props.searchState,
  };

  /*
     nextjs params.query doesn't handle nested objects
     once it does, params.query could be used directly here, but also inside the constructor
     to initialize the searchState.
  */
  static async getInitialProps(params) {
    const searchState = params.asPath.includes('?')
      ? qs.parse(params.asPath.substring(params.asPath.indexOf('?') + 1))
      : {};
    const resultsState = await findResultsState(App, { searchState });
    return { resultsState, searchState };
  }

  onSearchStateChange = searchState => {
    clearTimeout(this.debouncedSetState);
    this.debouncedSetState = setTimeout(() => {
      const href = searchStateToUrl(searchState);
      Router.push(href, href, {
        shallow: true,
      });
    }, updateAfter);
    this.setState({ searchState });
  };

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
            searchState={this.state.searchState}
            resultsState={this.props.resultsState}
            onSearchStateChange={this.onSearchStateChange}
            createURL={createURL}
          />
        </div>
      </div>
    );
  }
}
