import PropTypes from 'prop-types';
import React, { Component } from 'react';
import translatable from '../core/translatable';
import classNames from './classNames.js';

const cx = classNames('SearchBox');

const DefaultLoadingIndicator = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 38 38"
    xmlns="http://www.w3.org/2000/svg"
    stroke="#BFC7D8"
  >
    <g fill="none" fillRule="evenodd">
      <g transform="translate(1 1)" strokeWidth="2">
        <circle strokeOpacity=".5" cx="18" cy="18" r="18" />
        <path d="M36 18c0-9.94-8.06-18-18-18">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 18 18"
            to="360 18 18"
            dur="1s"
            repeatCount="indefinite"
          />
        </path>
      </g>
    </g>
  </svg>
);

const DefaultReset = () => (
  <svg role="img" width="1em" height="1em">
    <use xlinkHref="#sbx-icon-clear-3" />
  </svg>
);

const DefaultSubmit = () => (
  <svg role="img" width="1em" height="1em">
    <use xlinkHref="#sbx-icon-search-13" />
  </svg>
);

class SearchBox extends Component {
  static propTypes = {
    currentRefinement: PropTypes.string,
    refine: PropTypes.func.isRequired,
    translate: PropTypes.func.isRequired,

    loadingIndicatorComponent: PropTypes.element,
    resetComponent: PropTypes.element,
    submitComponent: PropTypes.element,

    focusShortcuts: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ),

    autoFocus: PropTypes.bool,

    searchAsYouType: PropTypes.bool,
    onSubmit: PropTypes.func,
    onReset: PropTypes.func,
    onChange: PropTypes.func,

    isSearchStalled: PropTypes.bool,
    showLoadingIndicator: PropTypes.bool,

    // For testing purposes
    __inputRef: PropTypes.func,
  };

  static defaultProps = {
    currentRefinement: '',
    focusShortcuts: ['s', '/'],
    autoFocus: false,
    searchAsYouType: true,
    showLoadingIndicator: false,
    isSearchStalled: false,
    loadingIndicatorComponent: <DefaultLoadingIndicator />,
    submitComponent: <DefaultSubmit />,
    resetComponent: <DefaultReset />,
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
    this.props.searchAsYouType
      ? this.props.currentRefinement
      : this.state.query;

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

    const shortcuts = this.props.focusShortcuts.map(
      key => (typeof key === 'string' ? key.toUpperCase().charCodeAt(0) : key)
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
    this.input.blur();

    const { refine, searchAsYouType } = this.props;
    if (!searchAsYouType) {
      refine(this.getQuery());
    }
    return false;
  };

  onChange = event => {
    const { searchAsYouType, refine, onChange } = this.props;
    const value = event.target.value;

    if (searchAsYouType) {
      refine(value);
    } else {
      this.setState({ query: value });
    }

    if (onChange) {
      onChange(event);
    }
  };

  onReset = event => {
    const { searchAsYouType, refine, onReset } = this.props;

    refine('');
    this.input.focus();

    if (!searchAsYouType) {
      this.setState({ query: '' });
    }

    if (onReset) {
      onReset(event);
    }
  };

  render() {
    const {
      translate,
      autoFocus,
      loadingIndicatorComponent,
      resetComponent,
      submitComponent,
    } = this.props;
    const query = this.getQuery();

    const searchInputEvents = Object.keys(this.props).reduce((props, prop) => {
      if (
        ['onsubmit', 'onreset', 'onchange'].indexOf(prop.toLowerCase()) ===
          -1 &&
        prop.indexOf('on') === 0
      ) {
        return { ...props, [prop]: this.props[prop] };
      }

      return props;
    }, {});

    const isSearchStalled =
      this.props.showLoadingIndicator && this.props.isSearchStalled;

    /* eslint-disable max-len */
    return (
      <form
        noValidate
        onSubmit={this.props.onSubmit ? this.props.onSubmit : this.onSubmit}
        onReset={this.onReset}
        {...cx('root')}
        action=""
        role="search"
      >
        <svg xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }}>
          <symbol
            xmlns="http://www.w3.org/2000/svg"
            id="sbx-icon-search-13"
            viewBox="0 0 40 40"
          >
            <path
              d="M26.804 29.01c-2.832 2.34-6.465 3.746-10.426 3.746C7.333 32.756 0 25.424 0 16.378 0 7.333 7.333 0 16.378 0c9.046 0 16.378 7.333 16.378 16.378 0 3.96-1.406 7.594-3.746 10.426l10.534 10.534c.607.607.61 1.59-.004 2.202-.61.61-1.597.61-2.202.004L26.804 29.01zm-10.426.627c7.323 0 13.26-5.936 13.26-13.26 0-7.32-5.937-13.257-13.26-13.257C9.056 3.12 3.12 9.056 3.12 16.378c0 7.323 5.936 13.26 13.258 13.26z"
              fillRule="evenodd"
            />
          </symbol>
          <symbol
            xmlns="http://www.w3.org/2000/svg"
            id="sbx-icon-clear-3"
            viewBox="0 0 20 20"
          >
            <path
              d="M8.114 10L.944 2.83 0 1.885 1.886 0l.943.943L10 8.113l7.17-7.17.944-.943L20 1.886l-.943.943-7.17 7.17 7.17 7.17.943.944L18.114 20l-.943-.943-7.17-7.17-7.17 7.17-.944.943L0 18.114l.943-.943L8.113 10z"
              fillRule="evenodd"
            />
          </symbol>
        </svg>
        <div
          role="search"
          {...cx('wrapper', isSearchStalled && 'stalled-search')}
        >
          <input
            ref={this.onInputMount}
            type="search"
            placeholder={translate('placeholder')}
            autoFocus={autoFocus}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            required
            maxLength="512"
            value={query}
            onChange={this.onChange}
            {...searchInputEvents}
            {...cx('input')}
          />
          {this.props.showLoadingIndicator && (
            <div hidden={!isSearchStalled} {...cx('loading-indicator')}>
              {loadingIndicatorComponent}
            </div>
          )}
          <button
            type="submit"
            title={translate('submitTitle')}
            hidden={isSearchStalled}
            {...cx('submit')}
          >
            {submitComponent}
          </button>
          <button
            type="reset"
            title={translate('resetTitle')}
            {...cx('reset')}
            onClick={this.onReset}
          >
            {resetComponent}
          </button>
        </div>
      </form>
    );
    /* eslint-enable */
  }
}

export default translatable({
  resetTitle: 'Clear the search query.',
  submitTitle: 'Submit your search query.',
  placeholder: 'Search here…',
})(SearchBox);
