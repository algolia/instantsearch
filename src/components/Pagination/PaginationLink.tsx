/** @jsx h */

import { h } from 'preact';
import cx from 'classnames';

import type { PaginationComponentCSSClasses } from './Pagination';

type PageLinkProps = {
  label: string;
  ariaLabel: string;
  pageNumber: number;
  isDisabled?: boolean;
  isSelected?: boolean;
  className?: string;
  cssClasses: PaginationComponentCSSClasses;
  createURL(value: number): string;
  handleClick(pageNumber: number, event: MouseEvent): void;
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
  handleClick,
}: PageLinkProps) {
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
          dangerouslySetInnerHTML={{
            __html: label,
          }}
        />
      ) : (
        <a
          className={cssClasses.link}
          aria-label={ariaLabel}
          href={createURL(pageNumber)}
          onClick={(event) => handleClick(pageNumber, event)}
          dangerouslySetInnerHTML={{
            __html: label,
          }}
        />
      )}
    </li>
  );
}

export default PaginationLink;
