/** @jsx h */

import { cx } from '@algolia/ui-components-shared';
import { h } from 'preact';

import { isSpecialClick } from '../../lib/utils';
import Template from '../Template/Template';

import type { ComponentCSSClasses } from '../../types';
import type {
  PaginationCSSClasses,
  PaginationTemplates,
} from '../../widgets/pagination/pagination';

export type PaginationComponentCSSClasses =
  ComponentCSSClasses<PaginationCSSClasses>;

export type PaginationComponentTemplates = Required<PaginationTemplates>;

export type PaginationProps = {
  createURL: (value: number) => string;
  cssClasses: PaginationComponentCSSClasses;
  templates: PaginationComponentTemplates;
  currentPage: number;
  nbPages: number;
  pages: number[];
  isFirstPage: boolean;
  isLastPage: boolean;
  setCurrentPage: (value: number) => void;
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
            templates={props.templates}
            templateKey="first"
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
            templates={props.templates}
            templateKey="previous"
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
            templates={props.templates}
            templateKey="page"
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
            templates={props.templates}
            templateKey="next"
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
            templates={props.templates}
            templateKey="last"
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
  templates: PaginationTemplates;
  templateKey: keyof PaginationTemplates;
  ariaLabel: string;
  pageNumber: number;
  isDisabled?: boolean;
  isSelected?: boolean;
  className?: string;
  cssClasses: PaginationComponentCSSClasses;
  createURL: (value: number) => string;
  createClickHandler: (pageNumber: number) => (event: MouseEvent) => void;
};

function PaginationLink({
  templates,
  templateKey,
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
        isDisabled && cssClasses.disabledItem,
        className,
        isSelected && cssClasses.selectedItem
      )}
    >
      {isDisabled ? (
        <Template
          rootTagName="span"
          rootProps={{
            className: cssClasses.link,
            'aria-label': ariaLabel,
          }}
          templateKey={templateKey}
          templates={templates}
          data={{
            page: pageNumber + 1,
          }}
        />
      ) : (
        <Template
          rootTagName="a"
          rootProps={{
            className: cssClasses.link,
            'aria-label': ariaLabel,
            href: createURL(pageNumber),
            onClick: createClickHandler(pageNumber),
          }}
          templateKey={templateKey}
          templates={templates}
          data={{
            page: pageNumber + 1,
          }}
        />
      )}
    </li>
  );
}

export default Pagination;
