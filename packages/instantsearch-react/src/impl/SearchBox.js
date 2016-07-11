import React, { Component, PropTypes } from 'react';
import themeable from 'react-themeable';

import createSearchBox from '../lib/createSearchBox';

import ClearIcon from './svg/ClearIcon.svg';
import SearchIcon from './svg/SearchIcon.svg';

export default createSearchBox(class SearchBox extends Component {
  static propTypes = {
    // Provided by `createSearchBox`
    query: PropTypes.string,
    setQuery: PropTypes.func.isRequired,
    search: PropTypes.func.isRequired,

    theme: PropTypes.object,
    placeholder: PropTypes.string,
    poweredBy: PropTypes.bool,
    autoFocus: PropTypes.bool,
    searchAsYouType: PropTypes.bool,
    queryHook: PropTypes.func,
    searchLabel: PropTypes.node,
    clearLabel: PropTypes.node,
  };

  static defaultProps = {
    query: '',

    theme: {
      form: 'SearchBox',
      wrapper: 'SearchBox__wrapper',
      input: 'SearchBox__input',
      submit: 'SearchBox__submit',
      reset: 'SearchBox__reset',
    },
    placeholder: 'Search your website',
    poweredBy: false,
    autoFocus: false,
    searchAsYouType: true,
    queryHook: (query, search) => search(query),
    searchLabel: <SearchIcon />,
    clearLabel: <ClearIcon />,
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
    const { queryHook, searchAsYouType } = this.props;
    this.setState({
      query: '',
    }, () => {
      this.input.focus();
    });
    if (searchAsYouType) {
      queryHook('', this.search);
    }
  };

  search = query => {
    const { setQuery, search } = this.props;
    setQuery(query);
    search();
  };

  render() {
    const {
      theme,
      placeholder,
      autoFocus,
      searchLabel,
      clearLabel,
    } = this.props;
    const { query } = this.state;
    const th = themeable(theme);

    return (
      <form
        noValidate
        onSubmit={this.onSubmit}
        onReset={this.onReset}
        {...th('form', 'form')}
      >
        <div
          role="search"
          {...th('wrapper', 'wrapper')}
        >
          <input
            ref={this.onInputMount}
            type="search"
            placeholder={placeholder}
            autoFocus={autoFocus}
            autoComplete={false}
            required
            value={query}
            onChange={this.onChange}
            {...th('input', 'input')}
          />
          <button
            type="submit"
            title="Submit your search query."
            {...th('submit', 'submit')}
          >
            {searchLabel}
          </button>
          <button
            type="reset"
            title="Clear the search query."
            {...th('reset', 'reset')}
          >
            {clearLabel}
          </button>
        </div>
      </form>
    );
  }
});
