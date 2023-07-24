import qs from 'qs';
import React, { Component } from 'react';

const updateAfter = 700;
const searchStateToURL = (searchState) =>
  searchState ? `${window.location.pathname}?${qs.stringify(searchState)}` : '';

const withURLSync = (App) =>
  class WithURLSync extends Component {
    state = {
      searchState: qs.parse(window.location.search.slice(1)),
    };

    componentDidMount() {
      window.addEventListener('popstate', this.onPopState);
    }

    componentWillUnmount() {
      clearTimeout(this.debouncedSetState);
      window.removeEventListener('popstate', this.onPopState);
    }

    onPopState = ({ state }) =>
      this.setState({
        searchState: state || {},
      });

    onSearchStateChange = (searchState) => {
      clearTimeout(this.debouncedSetState);

      this.debouncedSetState = setTimeout(() => {
        window.history.pushState(
          searchState,
          null,
          searchStateToURL(searchState)
        );
      }, updateAfter);

      this.setState({ searchState });
    };

    render() {
      const { searchState } = this.state;

      return (
        <App
          {...this.props}
          searchState={searchState}
          onSearchStateChange={this.onSearchStateChange}
          createURL={searchStateToURL}
        />
      );
    }
  };

export default withURLSync;
