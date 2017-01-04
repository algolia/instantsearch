import React, {Component, PropTypes} from 'react';
import translatable from '../core/translatable';
import classNames from './classNames.js';

const cx = classNames('SearchBox');

/* eslint-disable max-len */
const ResetIcon = () =>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26">
    <g fill="none" fillRule="evenodd">
      <path
        d="M12.99883 9.92647L22.22236.70294c.85882-.85647 2.2306-.84706 3.08235 0 .8518.85412.8471 2.22588 0 3.0753l-9.2329 9.22353 9.22353 9.22353c.85648.85882.84707 2.23058 0 3.08235-.8541.85176-2.22587.84706-3.0753 0l-9.22116-9.23294-9.22353 9.22357c-.85646.85647-2.22823.84706-3.07764 0-.85413-.85412-.84707-2.2259 0-3.0753l9.22823-9.22117L.70235 3.77823C-.1541 2.92177-.1541 1.55.69295.69588c.85647-.85176 2.22823-.84706 3.07764 0l9.2282 9.2353v-.0047z"/>
    </g>
  </svg>;
/* eslint-enable max-len */

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

    return (
      <form
        noValidate
        onSubmit={this.props.onSubmit ? this.props.onSubmit : this.onSubmit}
        onReset={this.onReset}
        {...cx('root')}
      >
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
          <button
            type="reset"
            title={translate('resetTitle')}
            {...cx('reset')}
          >
            {translate('reset')}
            {<ResetIcon/>}
          </button>
        </div>
      </form>
    );
  }
}

export default translatable({
  submit: null,
  reset: null,
  resetTitle: 'Clear the search query.',
  placeholder: 'Search here…',
})(SearchBox);
