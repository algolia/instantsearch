/* eslint-disable max-len, no-extra-parens */
import PropTypes from 'prop-types';
import React, { Component } from 'preact-compat';

export default class SearchBox extends Component {
  static propTypes = {
    placeholder: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onValidate: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
  };

  clearInput() {
    if (this.input) {
      this.input.value = '';
    }
  }

  validateSearch(e) {
    e.preventDefault();
    if (this.input) {
      const inputValue = this.input.value;
      if (inputValue) this.props.onValidate();
    }
  }

  render() {
    const { placeholder, onChange } = this.props;
    const inputCssClasses = this.props.disabled
      ? 'sbx-sffv__input sbx-sffv__input-disabled'
      : 'sbx-sffv__input';
    const formCssClasses = this.props.disabled
      ? 'searchbox sbx-sffv sbx-sffv-disabled'
      : 'searchbox sbx-sffv';

    return (
      <form
        noValidate="novalidate"
        className={formCssClasses}
        onReset={() => {
          onChange('');
        }}
        onSubmit={e => this.validateSearch(e)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }}>
          <symbol
            xmlns="http://www.w3.org/2000/svg"
            id="sbx-icon-search-12"
            viewBox="0 0 40 41"
          >
            <path
              d="M30.967 27.727l-.03-.03c-.778-.777-2.038-.777-2.815 0l-1.21 1.21c-.78.78-.778 2.04 0 2.817l.03.03 4.025-4.027zm1.083 1.084L39.24 36c.778.778.78 2.037 0 2.816l-1.21 1.21c-.777.778-2.038.78-2.816 0l-7.19-7.19 4.026-4.025zM15.724 31.45c8.684 0 15.724-7.04 15.724-15.724C31.448 7.04 24.408 0 15.724 0 7.04 0 0 7.04 0 15.724c0 8.684 7.04 15.724 15.724 15.724zm0-3.93c6.513 0 11.793-5.28 11.793-11.794 0-6.513-5.28-11.793-11.793-11.793C9.21 3.93 3.93 9.21 3.93 15.725c0 6.513 5.28 11.793 11.794 11.793z"
              fillRule="evenodd"
            />
          </symbol>
          <symbol
            xmlns="http://www.w3.org/2000/svg"
            id="sbx-icon-clear-2"
            viewBox="0 0 20 20"
          >
            <path
              d="M8.96 10L.52 1.562 0 1.042 1.04 0l.522.52L10 8.96 18.438.52l.52-.52L20 1.04l-.52.522L11.04 10l8.44 8.438.52.52L18.96 20l-.522-.52L10 11.04l-8.438 8.44-.52.52L0 18.96l.52-.522L8.96 10z"
              fillRule="evenodd"
            />
          </symbol>
        </svg>

        <div role="search" className="sbx-sffv__wrapper">
          <input
            type="search"
            name="search"
            placeholder={placeholder}
            autoComplete="off"
            required="required"
            className={inputCssClasses}
            onChange={e => onChange(e.target.value)}
            ref={i => {
              this.input = i;
            }}
            disabled={this.props.disabled}
          />
          <button
            type="submit"
            title="Submit your search query."
            className="sbx-sffv__submit"
          >
            <svg role="img" aria-label="Search">
              <use xlinkHref="#sbx-icon-search-12" />
            </svg>
          </button>
          <button
            type="reset"
            title="Clear the search query."
            className="sbx-sffv__reset"
          >
            <svg role="img" aria-label="Reset">
              <use xlinkHref="#sbx-icon-clear-2" />
            </svg>
          </button>
        </div>
      </form>
    );
  }
}
