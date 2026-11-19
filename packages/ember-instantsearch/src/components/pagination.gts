import Component from '@glimmer/component';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { connectPagination } from 'instantsearch.js/es/connectors/index';
import { isSpecialClick } from 'instantsearch.js/es/lib/utils/index';

import { definedOnly } from '../-private/use-widget.ts';
import { useConnector } from '../use-connector.ts';

import type { Parent } from '../types.ts';
import type { PaginationConnectorParams } from 'instantsearch.js/es/connectors/pagination/connectPagination';

export interface PaginationTranslations {
  firstPageItemText: string;
  previousPageItemText: string;
  nextPageItemText: string;
  lastPageItemText: string;
  pageItemText: (options: { currentPage: number; nbPages: number }) => string;
  firstPageItemAriaLabel: string;
  previousPageItemAriaLabel: string;
  nextPageItemAriaLabel: string;
  lastPageItemAriaLabel: string;
  pageItemAriaLabel: (options: {
    currentPage: number;
    nbPages: number;
  }) => string;
}

export interface PaginationSignature {
  Element: HTMLDivElement;
  Args: PaginationConnectorParams & {
    parent: Parent;
    /** @default true */
    showFirst?: boolean;
    /** @default true */
    showPrevious?: boolean;
    /** @default true */
    showNext?: boolean;
    /** @default true */
    showLast?: boolean;
    translations?: Partial<PaginationTranslations>;
  };
}

interface Item {
  key: string;
  className: string;
  isDisabled: boolean;
  isCurrent: boolean;
  page: number;
  href: string;
  text: string;
  ariaLabel: string;
}

/**
 * Links to the pages of results.
 *
 * @example
 * ```gjs
 * <ais.Pagination @padding={{2}} />
 * ```
 */
export default class Pagination extends Component<PaginationSignature> {
  connection = useConnector(
    this,
    () => this.args.parent,
    connectPagination,
    () =>
      definedOnly({
        padding: this.args.padding,
        totalPages: this.args.totalPages,
      }),
    { $$widgetType: 'ais.pagination' }
  );

  get state() {
    return this.connection.state;
  }

  get className() {
    return this.state.nbPages <= 1
      ? 'ais-Pagination ais-Pagination--noRefinement'
      : 'ais-Pagination';
  }

  get translations(): PaginationTranslations {
    return {
      firstPageItemText: '‹‹',
      previousPageItemText: '‹',
      nextPageItemText: '›',
      lastPageItemText: '››',
      pageItemText: ({ currentPage }) => String(currentPage),
      firstPageItemAriaLabel: 'First Page',
      previousPageItemAriaLabel: 'Previous Page',
      nextPageItemAriaLabel: 'Next Page',
      lastPageItemAriaLabel: `Last Page, Page ${this.state.nbPages}`,
      pageItemAriaLabel: ({ currentPage }) => `Page ${currentPage}`,
      ...this.args.translations,
    };
  }

  get items(): Item[] {
    const { args, translations } = this;
    const {
      pages = [],
      currentRefinement: currentPage,
      nbPages,
      isFirstPage,
      isLastPage,
      createURL,
    } = this.state;
    const items: Item[] = [];

    const add = (
      key: string,
      modifier: string,
      page: number,
      isDisabled: boolean,
      text: string,
      ariaLabel: string
    ) => {
      items.push({
        key,
        className: isDisabled
          ? `ais-Pagination-item ais-Pagination-item--disabled ${modifier}`
          : `ais-Pagination-item ${modifier}`,
        isDisabled,
        isCurrent: false,
        page,
        href: createURL(page),
        text,
        ariaLabel,
      });
    };

    if (args.showFirst ?? true) {
      add(
        'first',
        'ais-Pagination-item--firstPage',
        0,
        isFirstPage,
        translations.firstPageItemText,
        translations.firstPageItemAriaLabel
      );
    }

    if (args.showPrevious ?? true) {
      add(
        'previous',
        'ais-Pagination-item--previousPage',
        currentPage - 1,
        isFirstPage,
        translations.previousPageItemText,
        translations.previousPageItemAriaLabel
      );
    }

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]!;
      const isCurrent = page === currentPage;
      const options = { currentPage: page + 1, nbPages };

      items.push({
        key: String(page),
        className: isCurrent
          ? 'ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected'
          : 'ais-Pagination-item ais-Pagination-item--page',
        isDisabled: false,
        isCurrent,
        page,
        href: createURL(page),
        text: translations.pageItemText(options),
        ariaLabel: translations.pageItemAriaLabel(options),
      });
    }

    if (args.showNext ?? true) {
      add(
        'next',
        'ais-Pagination-item--nextPage',
        currentPage + 1,
        isLastPage,
        translations.nextPageItemText,
        translations.nextPageItemAriaLabel
      );
    }

    if (args.showLast ?? true) {
      add(
        'last',
        'ais-Pagination-item--lastPage',
        nbPages - 1,
        isLastPage,
        translations.lastPageItemText,
        translations.lastPageItemAriaLabel
      );
    }

    return items;
  }

  /**
   * A click with a modifier key opens the link, the same as any link.
   */
  handleClick = (page: number, event: MouseEvent) => {
    if (isSpecialClick(event)) return;

    event.preventDefault();

    this.state.refine(page);
  };

  <template>
    <div class={{this.className}} ...attributes>
      <ul class="ais-Pagination-list">
        {{#each this.items key="key" as |item|}}
          <li class={{item.className}}>
            {{#if item.isDisabled}}
              <span
                class="ais-Pagination-link"
                aria-label={{item.ariaLabel}}
              >{{item.text}}</span>
            {{else}}
              <a
                class="ais-Pagination-link"
                href={{item.href}}
                aria-label={{item.ariaLabel}}
                aria-current={{if item.isCurrent "page"}}
                {{on "click" (fn this.handleClick item.page)}}
              >{{item.text}}</a>
            {{/if}}
          </li>
        {{/each}}
      </ul>
    </div>
  </template>
}
