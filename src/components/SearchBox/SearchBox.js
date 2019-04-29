import React, { Component } from 'preact-compat';
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
    query: this.props.searchAsYouType ? '' : this.props.query,
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

  onChange = event => {
    const { searchAsYouType, refine, onChange } = this.props;
    const query = event.target.value;

    if (searchAsYouType) {
      refine(query);
    } else {
      this.setState({ query });
    }

    onChange(event);
  };

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
    const { searchAsYouType, refine, onReset } = this.props;
    const query = '';

    this.input.focus();

    refine(query);

    if (!searchAsYouType) {
      this.setState({ query });
    }

    onReset(event);
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
      searchAsYouType,
    } = this.props;

    const query = searchAsYouType ? this.props.query : this.state.query;

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
            value={query}
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
            onChange={this.onChange}
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
              hidden: !(showReset && query.trim() && !isSearchStalled),
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
