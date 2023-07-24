import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { translatable } from 'react-instantsearch-core';

import { createClassNames } from '../core/utils';

const cx = createClassNames('SearchBox');

const defaultLoadingIndicator = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 38 38"
    xmlns="http://www.w3.org/2000/svg"
    stroke="#444"
    className={cx('loadingIcon')}
    aria-hidden="true"
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

const defaultReset = (
  <svg
    className={cx('resetIcon')}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    width="10"
    height="10"
    aria-hidden="true"
  >
    <path d="M8.114 10L.944 2.83 0 1.885 1.886 0l.943.943L10 8.113l7.17-7.17.944-.943L20 1.886l-.943.943-7.17 7.17 7.17 7.17.943.944L18.114 20l-.943-.943-7.17-7.17-7.17 7.17-.944.943L0 18.114l.943-.943L8.113 10z" />
  </svg>
);

const defaultSubmit = (
  <svg
    className={cx('submitIcon')}
    xmlns="http://www.w3.org/2000/svg"
    width="10"
    height="10"
    viewBox="0 0 40 40"
    aria-hidden="true"
  >
    <path d="M26.804 29.01c-2.832 2.34-6.465 3.746-10.426 3.746C7.333 32.756 0 25.424 0 16.378 0 7.333 7.333 0 16.378 0c9.046 0 16.378 7.333 16.378 16.378 0 3.96-1.406 7.594-3.746 10.426l10.534 10.534c.607.607.61 1.59-.004 2.202-.61.61-1.597.61-2.202.004L26.804 29.01zm-10.426.627c7.323 0 13.26-5.936 13.26-13.26 0-7.32-5.937-13.257-13.26-13.257C9.056 3.12 3.12 9.056 3.12 16.378c0 7.323 5.936 13.26 13.258 13.26z" />
  </svg>
);

class SearchBox extends Component {
  static propTypes = {
    currentRefinement: PropTypes.string,
    className: PropTypes.string,
    refine: PropTypes.func.isRequired,
    translate: PropTypes.func.isRequired,

    loadingIndicator: PropTypes.node,
    reset: PropTypes.node,
    submit: PropTypes.node,

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

    formRef: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.exact({ current: PropTypes.object }),
    ]),

    inputRef: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.exact({ current: PropTypes.object }),
    ]),
    inputId: PropTypes.string,
  };

  static defaultProps = {
    currentRefinement: '',
    className: '',
    focusShortcuts: ['s', '/'],
    autoFocus: false,
    searchAsYouType: true,
    showLoadingIndicator: false,
    isSearchStalled: false,
    loadingIndicator: defaultLoadingIndicator,
    reset: defaultReset,
    submit: defaultSubmit,
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

  componentDidUpdate(prevProps) {
    if (
      !this.props.searchAsYouType &&
      prevProps.currentRefinement !== this.props.currentRefinement
    ) {
      this.setState({
        query: this.props.currentRefinement,
      });
    }
  }

  getQuery = () =>
    this.props.searchAsYouType
      ? this.props.currentRefinement
      : this.state.query;

  onInputMount = (input) => {
    this.input = input;
    if (!this.props.inputRef) return;
    if (typeof this.props.inputRef === 'function') {
      this.props.inputRef(input);
    } else {
      this.props.inputRef.current = input;
    }
  };

  // From https://github.com/algolia/autocomplete.js/pull/86
  onKeyDown = (e) => {
    if (!this.props.focusShortcuts) {
      return;
    }

    const shortcuts = this.props.focusShortcuts.map((key) =>
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

  onSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.input.blur();

    const { refine, searchAsYouType } = this.props;
    if (!searchAsYouType) {
      refine(this.getQuery());
    }
    return false;
  };

  onChange = (event) => {
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

  onReset = (event) => {
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
      className,
      inputId,
      translate,
      autoFocus,
      loadingIndicator,
      submit,
      reset,
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

    return (
      <div className={classNames(cx(''), className)}>
        <form
          ref={this.props.formRef}
          noValidate
          onSubmit={this.props.onSubmit ? this.props.onSubmit : this.onSubmit}
          onReset={this.onReset}
          className={cx('form', isSearchStalled && 'form--stalledSearch')}
          action=""
          role="search"
        >
          <input
            ref={this.onInputMount}
            id={inputId}
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
            className={cx('input')}
          />
          <button
            type="submit"
            title={translate('submitTitle')}
            className={cx('submit')}
          >
            {submit}
          </button>
          <button
            type="reset"
            title={translate('resetTitle')}
            className={cx('reset')}
            hidden={!query || isSearchStalled}
          >
            {reset}
          </button>
          {this.props.showLoadingIndicator && (
            <span hidden={!isSearchStalled} className={cx('loadingIndicator')}>
              {loadingIndicator}
            </span>
          )}
        </form>
      </div>
    );
  }
}

export default translatable({
  resetTitle: 'Clear the search query.',
  submitTitle: 'Submit your search query.',
  placeholder: 'Search here…',
})(SearchBox);
