/** @jsx h */

import { h, Component } from 'preact';
import PropTypes from 'prop-types';
import { noop } from '../../lib/utils';
import Template from '../Template/Template';

const SearchBoxCSSClasses = PropTypes.shape({
  root: PropTypes.string.isRequired,
  form: PropTypes.string.isRequired,
  input: PropTypes.string.isRequired,
  submit: PropTypes.string.isRequired,
  submitIcon: PropTypes.string.isRequired,
  reset: PropTypes.string.isRequired,
  resetIcon: PropTypes.string.isRequired,
  loadingIndicator: PropTypes.string.isRequired,
  loadingIcon: PropTypes.string.isRequired,
});

class SearchBox extends Component {
  static propTypes = {
    placeholder: PropTypes.string.isRequired,
    cssClasses: SearchBoxCSSClasses.isRequired,
    templates: PropTypes.object.isRequired,
    query: PropTypes.string,
    showSubmit: PropTypes.bool,
    showReset: PropTypes.bool,
    showLoadingIndicator: PropTypes.bool,
    refine: PropTypes.func,
    autofocus: PropTypes.bool,
    searchAsYouType: PropTypes.bool,
    isSearchStalled: PropTypes.bool,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    onReset: PropTypes.func,
  };

  static defaultProps = {
    query: '',
    showSubmit: true,
    showReset: true,
    showLoadingIndicator: true,
    autofocus: false,
    searchAsYouType: true,
    isSearchStalled: false,
    disabled: false,
    onChange: noop,
    onSubmit: noop,
    onReset: noop,
    refine: noop,
  };

  state = {
    query: this.props.query,
    focused: false,
  };

  /**
   * This public method is used in the RefinementList SFFV search box
   * to reset the input state when an item is selected.
   *
   * @see RefinementList#componentWillReceiveProps
   * @return {undefined}
   */
  resetInput() {
    this.setState({ query: '' });
  }

  onInput = event => {
    const { searchAsYouType, refine, onChange } = this.props;
    const query = event.target.value;

    if (searchAsYouType) {
      refine(query);
    }
    this.setState({ query });

    onChange(event);
  };

  componentWillReceiveProps(nextProps) {
    /**
     * when the user is typing, we don't want to replace the query typed
     * by the user (state.query) with the query exposed by the connector (props.query)
     * see: https://github.com/algolia/instantsearch.js/issues/4141
     */
    if (!this.state.focused && nextProps.query !== this.state.query) {
      this.setState({ query: nextProps.query });
    }
  }

  onSubmit = event => {
    const { searchAsYouType, refine, onSubmit } = this.props;

    event.preventDefault();
    event.stopPropagation();
    this.input.blur();

    if (!searchAsYouType) {
      refine(this.state.query);
    }

    onSubmit(event);

    return false;
  };

  onReset = event => {
    const { refine, onReset } = this.props;
    const query = '';

    this.input.focus();

    refine(query);
    this.setState({ query });

    onReset(event);
  };

  onBlur = () => {
    this.setState({ focused: false });
  };

  onFocus = () => {
    this.setState({ focused: true });
  };

  render() {
    const {
      cssClasses,
      placeholder,
      autofocus,
      showSubmit,
      showReset,
      showLoadingIndicator,
      templates,
      isSearchStalled,
    } = this.props;

    return (
      <div className={cssClasses.root}>
        <form
          action=""
          role="search"
          className={cssClasses.form}
          noValidate
          onSubmit={this.onSubmit}
          onReset={this.onReset}
        >
          <input
            ref={inputRef => (this.input = inputRef)}
            value={this.state.query}
            disabled={this.props.disabled}
            className={cssClasses.input}
            type="search"
            placeholder={placeholder}
            autoFocus={autofocus}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            maxLength={512}
            onInput={this.onInput}
            onBlur={this.onBlur}
            onFocus={this.onFocus}
          />

          <Template
            templateKey="submit"
            rootTagName="button"
            rootProps={{
              className: cssClasses.submit,
              type: 'submit',
              title: 'Submit the search query.',
              hidden: !showSubmit,
            }}
            templates={templates}
            data={{ cssClasses }}
          />

          <Template
            templateKey="reset"
            rootTagName="button"
            rootProps={{
              className: cssClasses.reset,
              type: 'reset',
              title: 'Clear the search query.',
              hidden: !(
                showReset &&
                this.state.query.trim() &&
                !isSearchStalled
              ),
            }}
            templates={templates}
            data={{ cssClasses }}
          />

          {showLoadingIndicator && (
            <Template
              templateKey="loadingIndicator"
              rootTagName="span"
              rootProps={{
                className: cssClasses.loadingIndicator,
                hidden: !isSearchStalled,
              }}
              templates={templates}
              data={{ cssClasses }}
            />
          )}
        </form>
      </div>
    );
  }
}

export default SearchBox;
