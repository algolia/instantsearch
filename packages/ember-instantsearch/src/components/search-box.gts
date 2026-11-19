import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { connectSearchBox } from 'instantsearch.js/es/connectors/index';

import { definedOnly } from '../-private/use-widget.ts';
import SearchBoxUi from '../-private/search-box-ui.gts';
import { useConnector } from '../use-connector.ts';

import type { SearchBoxTranslations } from '../-private/search-box-ui.gts';
import type { Parent } from '../types.ts';
import type { SearchBoxConnectorParams } from 'instantsearch.js/es/connectors/search-box/connectSearchBox';

export interface SearchBoxSignature {
  Element: HTMLDivElement;
  Args: SearchBoxConnectorParams & {
    parent: Parent;
    placeholder?: string;
    autofocus?: boolean;
    /**
     * Searches on each keystroke. Without it, the search waits for a submit.
     * @default true
     */
    searchAsYouType?: boolean;
    /**
     * Waits for the end of an IME composition before it searches.
     * @default false
     */
    ignoreCompositionEvents?: boolean;
    translations?: Partial<SearchBoxTranslations>;
    onSubmit?: (event: SubmitEvent) => void;
  };
}

/**
 * Text that the user typed, and the query that the widget had then.
 */
interface Typed {
  value: string;
  query: string;
}

/**
 * A search input that refines the query.
 *
 * @example
 * ```gjs
 * <ais.SearchBox @placeholder="Search for products" />
 * ```
 */
export default class SearchBox extends Component<SearchBoxSignature> {
  connection = useConnector(
    this,
    () => this.args.parent,
    connectSearchBox,
    () => definedOnly({ queryHook: this.args.queryHook }),
    { $$widgetType: 'ais.searchBox' }
  );

  @tracked typed: Typed | undefined;

  @tracked isFocused = false;

  get state() {
    return this.connection.state;
  }

  get query() {
    return this.state.query ?? '';
  }

  /**
   * What the user types stays in the input while it has focus.
   * Without focus, the input shows the query of the widget again,
   * once that query changes (from routing or another widget, for example).
   */
  get value() {
    const { typed, query } = this;

    if (typed && (this.isFocused || typed.query === query)) {
      return typed.value;
    }

    return query;
  }

  get searchAsYouType() {
    return this.args.searchAsYouType ?? true;
  }

  get translations(): SearchBoxTranslations {
    return {
      submitButtonTitle: 'Submit the search query',
      resetButtonTitle: 'Clear the search query',
      ...this.args.translations,
    };
  }

  setValue(value: string, isComposing: boolean) {
    this.typed = { value, query: this.query };

    if (
      this.searchAsYouType &&
      !(this.args.ignoreCompositionEvents && isComposing)
    ) {
      this.state.refine(value);
    }
  }

  handleInput = (value: string, isComposing: boolean) => {
    this.setValue(value, isComposing);
  };

  handleSubmit = (event: SubmitEvent) => {
    if (!this.searchAsYouType) {
      this.state.refine(this.value);
    }

    this.args.onSubmit?.(event);
  };

  handleReset = () => {
    this.setValue('', false);

    if (!this.searchAsYouType) {
      this.state.refine('');
    }
  };

  handleFocusChange = (isFocused: boolean) => {
    /**
     * Text typed before the query changed elsewhere is out of date.
     */
    if (isFocused && this.typed && this.typed.query !== this.query) {
      this.typed = undefined;
    }

    this.isFocused = isFocused;
  };

  <template>
    <SearchBoxUi
      @value={{this.value}}
      @placeholder={{@placeholder}}
      @autofocus={{@autofocus}}
      @isSearchStalled={{this.state.isSearchStalled}}
      @translations={{this.translations}}
      @onInput={{this.handleInput}}
      @onSubmit={{this.handleSubmit}}
      @onReset={{this.handleReset}}
      @onFocusChange={{this.handleFocusChange}}
      ...attributes
    />
  </template>
}
