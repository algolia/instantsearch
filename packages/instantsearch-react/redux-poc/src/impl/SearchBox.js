import React, { Component, PropTypes } from 'react';

import createSearchBox from '../lib/createSearchBox';

import ClearIcon from './svg/ClearIcon.svg';
import SearchIcon from './svg/SearchIcon.svg';

export default createSearchBox(class SearchBox extends Component {
  static propTypes = {
    // Provided by `createSearchBox`
    query: PropTypes.string,
    setQuery: PropTypes.func.isRequired,
    search: PropTypes.func.isRequired,

    placeholder: PropTypes.string,
    poweredBy: PropTypes.bool,
    autoFocus: PropTypes.bool,
    searchAsYouType: PropTypes.bool,
    queryHook: PropTypes.func,
  };

  static defaultProps = {
    query: '',
    placeholder: 'Search your website',
    poweredBy: false,
    autoFocus: false,
    searchAsYouType: true,
    queryHook: (query, search) => search(query),
  };

  constructor(props) {
    super();

    this.state = {
      query: props.query,
    };
  }

  onInputMount = input => {
    this.input = input;
  };

  onSubmit = e => {
    e.preventDefault();
    e.stopPropagation();

    const { queryHook, searchAsYouType } = this.props;
    const { query } = this.state;
    if (!searchAsYouType) {
      queryHook(query, this.search);
    }
    return false;
  };

  onChange = e => {
    const { queryHook, searchAsYouType } = this.props;
    const query = e.target.value;
    this.setState({ query });
    if (searchAsYouType) {
      queryHook(query, this.search);
    }
  };

  onReset = () => {
    const { queryHook } = this.props;
    this.setState({
      query: '',
    }, () => {
      this.input.focus();
    });
    queryHook('', this.search);
  };

  search = query => {
    const { setQuery, search } = this.props;
    setQuery(query);
    search();
  };

  render() {
    const { placeholder, autoFocus } = this.props;
    const { query } = this.state;

    return (
      <form onSubmit={this.onSubmit} onReset={this.onReset}>
        <div role="search">
          <input
            ref={this.onInputMount}
            type="search"
            placeholder={placeholder}
            autoFocus={autoFocus}
            autoComplete={false}
            required
            value={query}
            onChange={this.onChange}
          />
          <button
            type="submit"
            title="Submit your search query."
          >
            <SearchIcon />
          </button>
          <button
            type="reset"
            title="Clear the search query."
          >
            <ClearIcon />
          </button>
        </div>
      </form>
    );
  }
});
