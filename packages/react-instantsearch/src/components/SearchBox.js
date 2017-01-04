import React, {Component, PropTypes} from 'react';
import translatable from '../core/translatable';
import classNames from './classNames.js';

const cx = classNames('SearchBox');

class SearchBox extends Component {
  static propTypes = {
    currentRefinement: PropTypes.string,
    refine: PropTypes.func.isRequired,
    translate: PropTypes.func.isRequired,

    focusShortcuts: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ),

    autoFocus: PropTypes.bool,

    searchAsYouType: PropTypes.bool,
    onSubmit: PropTypes.func,

    // For testing purposes
    __inputRef: PropTypes.func,
  };

  static defaultProps = {
    currentRefinement: '',
    focusShortcuts: ['s', '/'],
    autoFocus: false,
    searchAsYouType: true,
  };

  constructor(props) {
    super();

    this.state = {
      query: props.searchAsYouType ? null : props.currentRefinement,
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
      nextProps.currentRefinement !== this.props.currentRefinement
    ) {
      this.setState({
        query: nextProps.currentRefinement,
      });
    }
  }

  getQuery = () =>
    this.props.searchAsYouType ?
      this.props.currentRefinement :
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
    if (this.props.__inputRef) {
      this.props.__inputRef(input);
    }
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
      translate,
      autoFocus,
    } = this.props;
    const query = this.getQuery();

    /* eslint-disable max-len */
    return (
      <form
        noValidate
        onSubmit={this.props.onSubmit ? this.props.onSubmit : this.onSubmit}
        onReset={this.onReset}
        {...cx('root')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" style={{display: 'none'}}>
          <symbol xmlns="http://www.w3.org/2000/svg" id="sbx-icon-search-13" viewBox="0 0 40 40">
            <path d="M26.804 29.01c-2.832 2.34-6.465 3.746-10.426 3.746C7.333 32.756 0 25.424 0 16.378 0 7.333 7.333 0 16.378 0c9.046 0 16.378 7.333 16.378 16.378 0 3.96-1.406 7.594-3.746 10.426l10.534 10.534c.607.607.61 1.59-.004 2.202-.61.61-1.597.61-2.202.004L26.804 29.01zm-10.426.627c7.323 0 13.26-5.936 13.26-13.26 0-7.32-5.937-13.257-13.26-13.257C9.056 3.12 3.12 9.056 3.12 16.378c0 7.323 5.936 13.26 13.258 13.26z"
            fillRule="evenodd" />
          </symbol>
          <symbol xmlns="http://www.w3.org/2000/svg" id="sbx-icon-clear-3" viewBox="0 0 20 20">
            <path d="M8.114 10L.944 2.83 0 1.885 1.886 0l.943.943L10 8.113l7.17-7.17.944-.943L20 1.886l-.943.943-7.17 7.17 7.17 7.17.943.944L18.114 20l-.943-.943-7.17-7.17-7.17 7.17-.944.943L0 18.114l.943-.943L8.113 10z" fillRule="evenodd" />
          </symbol>
        </svg>
        <div
          role="search"
          {...cx('wrapper')}
        >
          <input
            ref={this.onInputMount}
            type="search"
            placeholder={translate('placeholder')}
            autoFocus={autoFocus}
            autoComplete="off"
            required
            value={query}
            onChange={this.onChange}
            {...cx('input')}
          />
          <button type="submit" title={translate('submitTitle')} {...cx('submit')}>
            <svg role="img">
              <use href="#sbx-icon-search-13"></use>
            </svg>
          </button>
          <button type="reset" title={translate('resetTitle')} {...cx('reset')} onClick={this.onReset}>
            <svg role="img">
              <use href="#sbx-icon-clear-3"></use>
            </svg>
          </button>
        </div>
      </form>
    );
    /* eslint-enable */
  }
}

export default translatable({
  submit: null,
  reset: null,
  resetTitle: 'Clear the search query.',
  submitTitle: 'Submit your search query.',
  placeholder: 'Search here…',
})(SearchBox);
