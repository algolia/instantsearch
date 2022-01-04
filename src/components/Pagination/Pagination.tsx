/** @jsx h */

import { h } from 'preact';
import cx from 'classnames';

import PaginationLink from './PaginationLink';
import { isSpecialClick } from '../../lib/utils';
import type {
  PaginationCSSClasses,
  PaginationTemplates,
} from '../../widgets/pagination/pagination';
import type { ComponentCSSClasses } from '../../types';

export type PaginationComponentCSSClasses =
  ComponentCSSClasses<PaginationCSSClasses>;

export type PaginationComponentTemplates = Required<PaginationTemplates>;

export type PaginationProps = {
  createURL(value: number): string;
  cssClasses: PaginationComponentCSSClasses;
  currentPage: number;
  templates: PaginationComponentTemplates;
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

const defaultProps = {
  currentPage: 0,
  nbPages: 0,
  pages: [],
};

function Pagination(props: PaginationProps) {
  const handleClick = (pageNumber: number, event: MouseEvent) => {
    if (isSpecialClick(event)) {
      // do not alter the default browser behavior
      // if one special key is down
      return;
    }
    event.preventDefault();
    props.setCurrentPage(pageNumber);
  };

  return (
    <div
      className={cx(props.cssClasses.root, {
        [props.cssClasses.noRefinementRoot]: props.nbPages! <= 1,
      })}
    >
      <ul className={props.cssClasses.list}>
        {props.showFirst && (
          <PaginationLink
            key="first"
            ariaLabel={'First'}
            additionalClassName={props.cssClasses.firstPageItem}
            isDisabled={props.isFirstPage}
            label={props.templates.first}
            pageNumber={0}
            createURL={props.createURL}
            cssClasses={props.cssClasses}
            handleClick={handleClick}
          />
        )}

        {props.showPrevious && (
          <PaginationLink
            key="previous"
            ariaLabel={'Previous'}
            additionalClassName={props.cssClasses.previousPageItem}
            isDisabled={props.isFirstPage}
            label={props.templates.previous}
            pageNumber={props.currentPage - 1}
            createURL={props.createURL}
            cssClasses={props.cssClasses}
            handleClick={handleClick}
          />
        )}

        {props.pages!.map((pageNumber) => (
          <PaginationLink
            key={pageNumber}
            ariaLabel={`${pageNumber + 1}`}
            additionalClassName={props.cssClasses.pageItem}
            isSelected={pageNumber === props.currentPage}
            label={`${pageNumber + 1}`}
            pageNumber={pageNumber}
            createURL={props.createURL}
            cssClasses={props.cssClasses}
            handleClick={handleClick}
          />
        ))}

        {props.showNext && (
          <PaginationLink
            key="next"
            ariaLabel={'Next'}
            additionalClassName={props.cssClasses.nextPageItem}
            isDisabled={props.isLastPage}
            label={props.templates.next}
            pageNumber={props.currentPage + 1}
            createURL={props.createURL}
            cssClasses={props.cssClasses}
            handleClick={handleClick}
          />
        )}

        {props.showLast && (
          <PaginationLink
            key="last"
            ariaLabel={'Last'}
            additionalClassName={props.cssClasses.lastPageItem}
            isDisabled={props.isLastPage}
            label={props.templates.last}
            pageNumber={props.nbPages! - 1}
            createURL={props.createURL}
            cssClasses={props.cssClasses}
            handleClick={handleClick}
          />
        )}
      </ul>
    </div>
  );
}

Pagination.defaultProps = defaultProps;

export default Pagination;
