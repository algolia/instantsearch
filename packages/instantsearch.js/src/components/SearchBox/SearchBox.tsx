/** @jsx h */

import { h, createRef, Component } from 'preact';

import { noop } from '../../lib/utils';
import Template from '../Template/Template';

import type { ComponentCSSClasses } from '../../types';
import type {
  SearchBoxCSSClasses,
  SearchBoxTemplates,
} from '../../widgets/search-box/search-box';
import type { ComponentProps } from 'preact';

export type SearchBoxComponentCSSClasses =
  ComponentCSSClasses<SearchBoxCSSClasses>;

export type SearchBoxComponentTemplates = Required<SearchBoxTemplates>;

type SearchBoxProps = {
  placeholder?: string;
  cssClasses: SearchBoxComponentCSSClasses;
  templates: SearchBoxComponentTemplates;
  query?: string;
  showSubmit?: boolean;
  showReset?: boolean;
  showLoadingIndicator?: boolean;
  refine?: (value: string) => void;
  autofocus?: boolean;
  searchAsYouType?: boolean;
  ignoreCompositionEvents?: boolean;
  isSearchStalled?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  onChange?: (event: Event) => void;
  onSubmit?: (event: Event) => void;
  onReset?: (event: Event) => void;
  inputProps?: Partial<ComponentProps<'input'>>;
};

const defaultProps = {
  query: '',
  showSubmit: true,
  showReset: true,
  showLoadingIndicator: true,
  autofocus: false,
  searchAsYouType: true,
  ignoreCompositionEvents: false,
  isSearchStalled: false,
  disabled: false,
  ariaLabel: 'Search',
  onChange: noop,
  onSubmit: noop,
  onReset: noop,
  refine: noop,
  inputProps: {},
};

type SearchBoxPropsWithDefaultProps = SearchBoxProps &
  Readonly<typeof defaultProps>;

type SearchBoxState = {
  query: string;
  focused: boolean;
};

class SearchBox extends Component<
  SearchBoxPropsWithDefaultProps,
  SearchBoxState
> {
  public static defaultProps = defaultProps;

  public state = {
    query: this.props.query,
    focused: false,
  };

  private input = createRef<HTMLInputElement>();

  /**
   * This public method is used in the RefinementList SFFV search box
   * to reset the input state when an item is selected.
   *
   * @see RefinementList#componentWillReceiveProps
   * @return {undefined}
   */
  public resetInput() {
    this.setState({ query: '' });
  }

  private onInput = (event: Event) => {
    // @ts-expect-error the context incompatibility of `this` doesn't matter
    this.props.inputProps.onInput?.(event);

    const { searchAsYouType, refine, onChange } = this.props;
    const query = (event.target as HTMLInputElement).value;

    if (
      !(
        this.props.ignoreCompositionEvents &&
        (event as KeyboardEvent).isComposing
      )
    ) {
      if (searchAsYouType) {
        refine(query);
      }
      this.setState({ query });

      onChange(event);
    }
  };

  public componentWillReceiveProps(nextProps: SearchBoxPropsWithDefaultProps) {
    /**
     * when the user is typing, we don't want to replace the query typed
     * by the user (state.query) with the query exposed by the connector (props.query)
     * see: https://github.com/algolia/instantsearch/issues/4141
     */
    if (!this.state.focused && nextProps.query !== this.state.query) {
      this.setState({ query: nextProps.query });
    }
  }

  private onSubmit = (event: Event) => {
    const { searchAsYouType, refine, onSubmit } = this.props;

    event.preventDefault();
    event.stopPropagation();
    if (this.input.current) {
      this.input.current.blur();
    }

    if (!searchAsYouType) {
      refine(this.state.query);
    }

    onSubmit(event);

    return false;
  };

  private onReset = (event: Event) => {
    const { refine, onReset } = this.props;
    const query = '';

    if (this.input.current) {
      this.input.current.focus();
    }

    refine(query);
    this.setState({ query });

    onReset(event);
  };

  private onBlur = (event: FocusEvent) => {
    // @ts-expect-error the context incompatibility of `this` doesn't matter
    this.props.inputProps.onBlur?.(event);

    this.setState({ focused: false });
  };

  private onFocus: (event: FocusEvent) => void = (event) => {
    // @ts-expect-error the context incompatibility of `this` doesn't matter
    this.props.inputProps.onFocus?.(event);

    this.setState({ focused: true });
  };

  public render() {
    const {
      cssClasses,
      placeholder,
      autofocus,
      showSubmit,
      showReset,
      showLoadingIndicator,
      templates,
      isSearchStalled,
      ariaLabel,
      inputProps,
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
            {...inputProps}
            ref={this.input}
            value={this.state.query}
            disabled={this.props.disabled}
            className={cssClasses.input}
            type="search"
            placeholder={placeholder}
            autoFocus={autofocus}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            // @ts-expect-error `spellCheck` attribute is missing in preact JSX types
            spellCheck="false"
            maxLength={512}
            onInput={this.onInput}
            // see: https://github.com/preactjs/preact/issues/1978
            // eslint-disable-next-line react/no-unknown-property
            oncompositionend={this.onInput}
            onBlur={this.onBlur}
            onFocus={this.onFocus}
            aria-label={ariaLabel}
          />

          <Template
            templateKey="submit"
            rootTagName="button"
            rootProps={{
              className: cssClasses.submit,
              type: 'submit',
              title: 'Submit the search query',
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
              title: 'Clear the search query',
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
