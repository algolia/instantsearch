/** @jsx h */

import { h, createRef, Component } from 'preact';
import { noop } from '../../lib/utils';
import Template from '../Template/Template';
import {
  SearchBoxRendererCSSClasses,
  SearchBoxTemplates,
} from '../../widgets/search-box/search-box';

type SearchBoxProps = {
  placeholder?: string;
  cssClasses: SearchBoxRendererCSSClasses;
  templates?: SearchBoxTemplates;
  query?: string;
  showSubmit?: boolean;
  showReset?: boolean;
  showLoadingIndicator?: boolean;
  refine?: (value: string) => void;
  autofocus?: boolean;
  searchAsYouType?: boolean;
  isSearchStalled?: boolean;
  disabled?: boolean;
  onChange?: (event: Event) => void;
  onSubmit?: (event: Event) => void;
  onReset?: (event: Event) => void;
};

const defaultProps = {
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
    const { searchAsYouType, refine, onChange } = this.props;
    const query = (event.target as HTMLInputElement).value;

    if (searchAsYouType) {
      refine(query);
    }
    this.setState({ query });

    onChange(event);
  };

  public componentWillReceiveProps(nextProps: SearchBoxPropsWithDefaultProps) {
    /**
     * when the user is typing, we don't want to replace the query typed
     * by the user (state.query) with the query exposed by the connector (props.query)
     * see: https://github.com/algolia/instantsearch.js/issues/4141
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

  private onBlur = () => {
    this.setState({ focused: false });
  };

  private onFocus = () => {
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
    } = this.props;

    return (
      <div className={cssClasses.root}>
        <form
          action=""
          role="search"
          className={cssClasses.form}
          noValidate
          onSubmit={this.onSubmit}
          // @ts-expect-error `onReset` attibute is missing in preact 10.0.0 JSX types
          onReset={this.onReset}
        >
          <input
            ref={this.input}
            value={this.state.query}
            disabled={this.props.disabled}
            className={cssClasses.input}
            type="search"
            placeholder={placeholder}
            autoFocus={autofocus}
            autoComplete="off"
            autoCorrect="off"
            // @ts-expect-error `autoCapitalize` attibute is missing in preact 10.0.0 JSX types
            autoCapitalize="off"
            spellCheck="false"
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
