import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { connectRefinementList } from 'instantsearch.js/es/connectors/index';
import {
  getHighlightedParts,
  unescape,
} from 'instantsearch.js/es/lib/utils/index';

import HighlightParts from '../-private/highlight-parts.gts';
import SearchBoxUi from '../-private/search-box-ui.gts';
import { definedOnly } from '../-private/use-widget.ts';
import { useConnector } from '../use-connector.ts';

import type { Parent } from '../types.ts';
import type {
  RefinementListConnectorParams,
  RefinementListItem,
} from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList';

export interface RefinementListTranslations {
  resetButtonTitle: string;
  submitButtonTitle: string;
  noResultsText: string;
  showMoreButtonText: (options: { isShowingMore: boolean }) => string;
  showMoreButtonLabel?: string;
}

export interface RefinementListSignature {
  Element: HTMLDivElement;
  Args: RefinementListConnectorParams & {
    parent: Parent;
    /**
     * Shows an input to search in the facet values.
     */
    searchable?: boolean;
    searchablePlaceholder?: string;
    /**
     * Refines the first value of the search on submit.
     * @default true
     */
    searchableSelectOnSubmit?: boolean;
    translations?: Partial<RefinementListTranslations>;
  };
}

function highlightedParts(item: RefinementListItem) {
  return [getHighlightedParts(unescape(item.highlighted || ''))];
}

function itemClass(item: RefinementListItem) {
  return item.isRefined
    ? 'ais-RefinementList-item ais-RefinementList-item--selected'
    : 'ais-RefinementList-item';
}

/**
 * A list of facet values to filter the results, with checkboxes.
 *
 * @example
 * ```gjs
 * <ais.RefinementList @attribute="brand" @showMore={{true}} />
 * ```
 */
export default class RefinementList extends Component<RefinementListSignature> {
  connection = useConnector(
    this,
    () => this.args.parent,
    connectRefinementList,
    () =>
      definedOnly({
        attribute: this.args.attribute,
        operator: this.args.operator,
        limit: this.args.limit,
        showMore: this.args.showMore,
        showMoreLimit: this.args.showMoreLimit,
        sortBy: this.args.sortBy,
        escapeFacetValues: this.args.escapeFacetValues,
        transformItems: this.args.transformItems,
      }) as RefinementListConnectorParams,
    { $$widgetType: 'ais.refinementList' }
  );

  /**
   * The text in the search input of the facet values.
   */
  @tracked query = '';

  get state() {
    return this.connection.state;
  }

  get items() {
    return this.state.items ?? [];
  }

  get className() {
    return this.items.length === 0
      ? 'ais-RefinementList ais-RefinementList--noRefinement'
      : 'ais-RefinementList';
  }

  get translations(): RefinementListTranslations {
    return {
      resetButtonTitle: 'Clear the search query',
      submitButtonTitle: 'Submit the search query',
      noResultsText: 'No results.',
      showMoreButtonText: ({ isShowingMore }) =>
        isShowingMore ? 'Show less' : 'Show more',
      ...this.args.translations,
    };
  }

  get showNoResults() {
    return (
      this.args.searchable && this.state.isFromSearch && this.items.length === 0
    );
  }

  get showMoreClass() {
    return this.state.canToggleShowMore
      ? 'ais-RefinementList-showMore'
      : 'ais-RefinementList-showMore ais-RefinementList-showMore--disabled';
  }

  get showMoreText() {
    return this.translations.showMoreButtonText({
      isShowingMore: Boolean(this.state.isShowingMore),
    });
  }

  setQuery(query: string, isComplete = true) {
    this.query = query;

    if (isComplete) {
      this.state.searchForItems(query);
    }
  }

  handleRefine = (item: RefinementListItem) => {
    this.state.refine(item.value);
    this.setQuery('');
  };

  handleInput = (value: string, isComposing: boolean) => {
    this.setQuery(value, !isComposing);
  };

  handleReset = () => {
    this.setQuery('');
  };

  handleSubmit = () => {
    if (this.args.searchableSelectOnSubmit === false) return;

    const first = this.items[0];

    if (first) {
      this.state.refine(first.value);
      this.setQuery('');
    }
  };

  handleToggleShowMore = () => {
    this.state.toggleShowMore();
  };

  <template>
    <div class={{this.className}} ...attributes>
      {{#if @searchable}}
        <div class="ais-RefinementList-searchBox">
          <SearchBoxUi
            @value={{this.query}}
            @placeholder={{@searchablePlaceholder}}
            @isSearchStalled={{false}}
            @translations={{this.translations}}
            @onInput={{this.handleInput}}
            @onSubmit={{this.handleSubmit}}
            @onReset={{this.handleReset}}
          />
        </div>
      {{/if}}
      {{#if this.showNoResults}}
        <div class="ais-RefinementList-noResults">{{this.translations.noResultsText}}</div>
      {{else}}
        <ul class="ais-RefinementList-list">
          {{#each this.items key="value" as |item|}}
            <li class={{itemClass item}}>
              <label class="ais-RefinementList-label">
                <input
                  checked={{item.isRefined}}
                  class="ais-RefinementList-checkbox"
                  type="checkbox"
                  value={{item.value}}
                  {{on "change" (fn this.handleRefine item)}}
                />
                <span class="ais-RefinementList-labelText">
                  {{#if this.query}}
                    <HighlightParts @parts={{highlightedParts item}} />
                  {{else}}
                    {{item.label}}
                  {{/if}}
                </span>
                <span class="ais-RefinementList-count">{{item.count}}</span>
              </label>
            </li>
          {{/each}}
        </ul>
      {{/if}}
      {{#if @showMore}}
        <button
          class={{this.showMoreClass}}
          disabled={{if this.state.canToggleShowMore false true}}
          aria-expanded={{if this.state.isShowingMore "true" "false"}}
          aria-label={{this.translations.showMoreButtonLabel}}
          {{on "click" this.handleToggleShowMore}}
        >{{this.showMoreText}}</button>
      {{/if}}
    </div>
  </template>
}
