/** @jsx h */

import { Component, h } from 'preact';
import cx from 'classnames';

import PaginationLink from './PaginationLink';
import { isSpecialClick } from '../../lib/utils';
import {
  PaginationCSSClasses,
  PaginationTemplates,
} from '../../widgets/pagination/pagination';

export type PaginationComponentCSSClasses = {
  [TClassName in keyof PaginationCSSClasses]: string;
};

export type PaginationProps = {
  createURL(value: number): string;
  cssClasses: PaginationComponentCSSClasses;
  currentPage: number;
  templates: PaginationTemplates;
  nbPages?: number;
  pages?: number[];
  isFirstPage: boolean;
  isLastPage: boolean;
  setCurrentPage(value: number): void;
  showFirst?: boolean;
  showLast?: boolean;
  showPrevious?: boolean;
  showNext?: boolean;
};

type PageLink = {
  label: string;
  ariaLabel: string;
  pageNumber: number;
  additionalClassName: string | null;
  isDisabled?: boolean;
  isSelected?: boolean;
  createURL(value: number): string;
};

const defaultProps = {
  currentPage: 0,
  nbPages: 0,
  pages: [],
};

class Pagination extends Component<PaginationProps> {
  public static defaultProps = defaultProps;

  private pageLink({
    label,
    ariaLabel,
    pageNumber,
    additionalClassName = null,
    isDisabled = false,
    isSelected = false,
    createURL,
  }: PageLink) {
    const cssClasses = {
      item: cx(this.props.cssClasses.item, additionalClassName),
      link: this.props.cssClasses.link,
    };

    if (isDisabled) {
      cssClasses.item = cx(cssClasses.item, this.props.cssClasses.disabledItem);
    } else if (isSelected) {
      cssClasses.item = cx(cssClasses.item, this.props.cssClasses.selectedItem);
    }

    const url = !isDisabled ? createURL(pageNumber) : '#';

    return (
      <PaginationLink
        ariaLabel={ariaLabel}
        cssClasses={cssClasses}
        handleClick={this.handleClick}
        isDisabled={isDisabled}
        key={label + pageNumber + ariaLabel}
        label={label}
        pageNumber={pageNumber}
        url={url}
      />
    );
  }

  public handleClick = (pageNumber: number, event: MouseEvent) => {
    if (isSpecialClick(event)) {
      // do not alter the default browser behavior
      // if one special key is down
      return;
    }
    event.preventDefault();
    this.props.setCurrentPage(pageNumber);
  };

  private previousPageLink = () => {
    return this.pageLink({
      ariaLabel: 'Previous',
      additionalClassName: this.props.cssClasses.previousPageItem,
      isDisabled: this.props.isFirstPage,
      label: this.props.templates.previous,
      pageNumber: this.props.currentPage - 1,
      createURL: this.props.createURL,
    });
  };

  private nextPageLink = () => {
    return this.pageLink({
      ariaLabel: 'Next',
      additionalClassName: this.props.cssClasses.nextPageItem,
      isDisabled: this.props.isLastPage,
      label: this.props.templates.next,
      pageNumber: this.props.currentPage + 1,
      createURL: this.props.createURL,
    });
  };

  private firstPageLink = () => {
    return this.pageLink({
      ariaLabel: 'First',
      additionalClassName: this.props.cssClasses.firstPageItem,
      isDisabled: this.props.isFirstPage,
      label: this.props.templates.first,
      pageNumber: 0,
      createURL: this.props.createURL,
    });
  };

  private lastPageLink = () => {
    return this.pageLink({
      ariaLabel: 'Last',
      additionalClassName: this.props.cssClasses.lastPageItem,
      isDisabled: this.props.isLastPage,
      label: this.props.templates.last,
      pageNumber: this.props.nbPages! - 1,
      createURL: this.props.createURL,
    });
  };

  private pages = () => {
    return this.props.pages!.map(pageNumber =>
      this.pageLink({
        ariaLabel: `${pageNumber + 1}`,
        additionalClassName: this.props.cssClasses.pageItem,
        isSelected: pageNumber === this.props.currentPage,
        label: `${pageNumber + 1}`,
        pageNumber,
        createURL: this.props.createURL,
      })
    );
  };

  public render() {
    return (
      <div
        className={cx(this.props.cssClasses.root, {
          [this.props.cssClasses.noRefinementRoot]: this.props.nbPages! <= 1,
        })}
      >
        <ul className={this.props.cssClasses.list}>
          {this.props.showFirst && this.firstPageLink()}
          {this.props.showPrevious && this.previousPageLink()}
          {this.pages()}
          {this.props.showNext && this.nextPageLink()}
          {this.props.showLast && this.lastPageLink()}
        </ul>
      </div>
    );
  }
}

export default Pagination;
