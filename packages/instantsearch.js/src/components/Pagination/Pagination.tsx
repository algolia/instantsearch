/** @jsx h */

import { cx } from '@algolia/ui-components-shared';
import { h } from 'preact';

import { isSpecialClick } from '../../lib/utils';

import type { ComponentCSSClasses } from '../../types';
import type {
  PaginationCSSClasses,
  PaginationTemplates,
} from '../../widgets/pagination/pagination';

export type PaginationComponentCSSClasses =
  ComponentCSSClasses<PaginationCSSClasses>;

export type PaginationComponentTemplates = Required<PaginationTemplates>;

export type PaginationProps = {
  createURL(value: number): string;
  cssClasses: PaginationComponentCSSClasses;
  templates: PaginationComponentTemplates;
  currentPage: number;
  nbPages: number;
  pages: number[];
  isFirstPage: boolean;
  isLastPage: boolean;
  setCurrentPage(value: number): void;
  showFirst?: boolean;
  showLast?: boolean;
  showPrevious?: boolean;
  showNext?: boolean;
};

function Pagination(props: PaginationProps) {
  function createClickHandler(pageNumber: number) {
    return (event: MouseEvent) => {
      if (isSpecialClick(event)) {
        // do not alter the default browser behavior
        // if one special key is down
        return;
      }
      event.preventDefault();
      props.setCurrentPage(pageNumber);
    };
  }

  return (
    <div
      className={cx(
        props.cssClasses.root,
        props.nbPages <= 1 && props.cssClasses.noRefinementRoot
      )}
    >
      <ul className={props.cssClasses.list}>
        {props.showFirst && (
          <PaginationLink
            ariaLabel="First"
            className={props.cssClasses.firstPageItem}
            isDisabled={props.isFirstPage}
            label={props.templates.first}
            pageNumber={0}
            createURL={props.createURL}
            cssClasses={props.cssClasses}
            createClickHandler={createClickHandler}
          />
        )}

        {props.showPrevious && (
          <PaginationLink
            ariaLabel="Previous"
            className={props.cssClasses.previousPageItem}
            isDisabled={props.isFirstPage}
            label={props.templates.previous}
            pageNumber={props.currentPage - 1}
            createURL={props.createURL}
            cssClasses={props.cssClasses}
            createClickHandler={createClickHandler}
          />
        )}

        {props.pages.map((pageNumber) => (
          <PaginationLink
            key={pageNumber}
            ariaLabel={`Page ${pageNumber + 1}`}
            className={props.cssClasses.pageItem}
            isSelected={pageNumber === props.currentPage}
            label={`${pageNumber + 1}`}
            pageNumber={pageNumber}
            createURL={props.createURL}
            cssClasses={props.cssClasses}
            createClickHandler={createClickHandler}
          />
        ))}

        {props.showNext && (
          <PaginationLink
            ariaLabel="Next"
            className={props.cssClasses.nextPageItem}
            isDisabled={props.isLastPage}
            label={props.templates.next}
            pageNumber={props.currentPage + 1}
            createURL={props.createURL}
            cssClasses={props.cssClasses}
            createClickHandler={createClickHandler}
          />
        )}

        {props.showLast && (
          <PaginationLink
            ariaLabel="Last"
            className={props.cssClasses.lastPageItem}
            isDisabled={props.isLastPage}
            label={props.templates.last}
            pageNumber={props.nbPages - 1}
            createURL={props.createURL}
            cssClasses={props.cssClasses}
            createClickHandler={createClickHandler}
          />
        )}
      </ul>
    </div>
  );
}

type PaginationLinkProps = {
  label: string;
  ariaLabel: string;
  pageNumber: number;
  isDisabled?: boolean;
  isSelected?: boolean;
  className?: string;
  cssClasses: PaginationComponentCSSClasses;
  createURL(value: number): string;
  createClickHandler: (pageNumber: number) => (event: MouseEvent) => void;
};

function PaginationLink({
  label,
  ariaLabel,
  pageNumber,
  className,
  isDisabled = false,
  isSelected = false,
  cssClasses,
  createURL,
  createClickHandler,
}: PaginationLinkProps) {
  return (
    <li
      className={cx(
        cssClasses.item,
        className,
        isDisabled && cssClasses.disabledItem,
        isSelected && cssClasses.selectedItem
      )}
    >
      {isDisabled ? (
        <span
          className={cssClasses.link}
          dangerouslySetInnerHTML={{ __html: label }}
        />
      ) : (
        <a
          className={cssClasses.link}
          aria-label={ariaLabel}
          href={createURL(pageNumber)}
          onClick={createClickHandler(pageNumber)}
          dangerouslySetInnerHTML={{ __html: label }}
        />
      )}
    </li>
  );
}

export default Pagination;
