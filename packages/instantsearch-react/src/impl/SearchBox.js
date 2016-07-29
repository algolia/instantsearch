import React, {Component, PropTypes} from 'react';
import themeable from 'react-themeable';

import {getTranslation} from '../utils';

const defaultTranslations = {
  submit: null,
  reset: null,
  submitTitle: 'Submit your search query.',
  resetTitle: 'Clear the search query.',
  placeholder: 'Search your website',
};

const defaultTheme = {
  root: 'SearchBox',
  wrapper: 'SearchBox__wrapper',
  input: 'SearchBox__input',
  submit: 'SearchBox__submit',
  reset: 'SearchBox__reset',
};

class SearchBox extends Component {
  static propTypes = {
    query: PropTypes.string,
    refine: PropTypes.func.isRequired,
    theme: PropTypes.object,
    translations: PropTypes.object,
    // @TODO: implement
    // poweredBy: PropTypes.bool,
    focusShortcuts: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ),
    autoFocus: PropTypes.bool,
    searchAsYouType: PropTypes.bool,
  };

  static defaultProps = {
    query: '',
    theme: defaultTheme,
    translations: defaultTranslations,
    poweredBy: false,
    focusShortcuts: ['s', '/'],
    autoFocus: false,
    searchAsYouType: true,
  };

  constructor(props) {
    super();

    this.state = {
      query: props.searchAsYouType ? null : props.query,
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  componentWillReceiveProps(nextProps) {
    // Reset query when the searchParameters query has changed.
    // This is kind of an anti-pattern (props in state), but it works here
    // since we know for sure that searchParameters having changed means a
    // new search has been triggered.
    if (
      !nextProps.searchAsYouType &&
      nextProps.query !== this.props.query
    ) {
      this.setState({
        query: nextProps.query,
      });
    }
  }

  getQuery = () =>
    this.props.searchAsYouType ?
      this.props.query :
      this.state.query;

  setQuery = val => {
    const {refine, searchAsYouType} = this.props;
    if (searchAsYouType) {
      refine(val);
    } else {
      this.setState({
        query: val,
      });
    }
  }

  onInputMount = input => {
    this.input = input;
  };

  // From https://github.com/algolia/autocomplete.js/pull/86
  onKeyDown = e => {
    if (!this.props.focusShortcuts) {
      return;
    }

    const shortcuts = this.props.focusShortcuts.map(key =>
      typeof key === 'string' ? key.toUpperCase().charCodeAt(0) : key
    );

    const elt = e.target || e.srcElement;
    const tagName = elt.tagName;
    if (
      elt.isContentEditable ||
      tagName === 'INPUT' ||
      tagName === 'SELECT' ||
      tagName === 'TEXTAREA'
    ) {
      // already in an input
      return;
    }

    const which = e.which || e.keyCode;
    if (shortcuts.indexOf(which) === -1) {
      // not the right shortcut
      return;
    }

    this.input.focus();
    e.stopPropagation();
    e.preventDefault();
  };

  onSubmit = e => {
    e.preventDefault();
    e.stopPropagation();

    const {refine, searchAsYouType} = this.props;
    if (!searchAsYouType) {
      refine(this.getQuery());
    }
    return false;
  };

  onChange = e => {
    this.setQuery(e.target.value);
  };

  onReset = () => {
    this.setQuery('');
    this.input.focus();
  };

  render() {
    const {
      theme,
      translations,
      autoFocus,
    } = this.props;
    const query = this.getQuery();
    const th = themeable(theme);

    return (
      <form
        noValidate
        onSubmit={this.onSubmit}
        onReset={this.onReset}
        {...th('root', 'root')}
      >
        <div
          role="search"
          {...th('wrapper', 'wrapper')}
        >
          <input
            ref={this.onInputMount}
            type="search"
            placeholder={getTranslation(
              'placeholder',
              defaultTranslations,
              translations
            )}
            autoFocus={autoFocus}
            autoComplete={false}
            required
            value={query}
            onChange={this.onChange}
            {...th('input', 'input')}
          />
          <button
            type="submit"
            title={getTranslation(
              'submitTitle',
              defaultTranslations,
              translations
            )}
            {...th('submit', 'submit')}
          >
            {getTranslation('submit', defaultTranslations, translations)}
          </button>
          <button
            type="reset"
            title={getTranslation(
              'resetTitle',
              defaultTranslations,
              translations
            )}
            {...th('reset', 'reset')}
          >
            {getTranslation('reset', defaultTranslations, translations)}
          </button>
        </div>
      </form>
    );
  }
}

export default SearchBox;
